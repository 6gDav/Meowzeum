import type { Context } from "hono";
import { UpdateProfileInputSchema } from "@Meowzeum/shared-types";
import { turso } from "./helper/tursoClient";
import { createSessionResponse } from "./helper/setupJWT";
import { sendEmail } from "./helper/sendEmail";
import { getSessionUser } from "./helper/getSession";
import { emilSendTime } from "./helper/getCurretnTime";

export async function updateProfile(c: Context) {
    // 1) get user id
    const auth = await getSessionUser(c).catch(() =>
        c.json({ success: false, error: "Internal server error" }, 500),
    );

    if (typeof auth !== "number") {
        return auth;
    }

    const userId: number = auth;

    // 2) Validate schema
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ success: false, error: "Invalid JSON body" }, 400);
    }

    const parsed = UpdateProfileInputSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
            400,
        );
    }

    const { firstName, lastName, password } = parsed.data;
    const normalizedEmail = parsed.data.email.trim().toLowerCase();

    // 3) Chaching for other users email
    try {
        const existing = await turso.execute({
            sql: `SELECT id FROM users WHERE email = ? AND id != ?`,
            args: [normalizedEmail, userId],
        });
        if (existing.rows.length > 0) {
            return c.json({ success: false, error: "Email is already in use" }, 409);
        }
    } catch (err) {
        console.error("updateProfile DB error (email check):", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }

    // 4) UPDATE if there is a new field
    const sets = ["firstName = ?", "lastName = ?", "email = ?"];
    const args: (string | number)[] = [firstName, lastName, normalizedEmail];

    if (password) {
        sets.push("password_hash = ?");
        args.push(await Bun.password.hash(password)); 
    }
    args.push(userId);

    let user: { id: number; firstName: string; lastName: string; email: string };

    try {
        const result = await turso.execute({
            sql: `UPDATE users SET ${sets.join(", ")}
                  WHERE id = ?
                  RETURNING id, firstName, lastName, email`,
            args,
        });
        const row = result.rows[0];
        if (!row) {
            return c.json({ success: false, error: "User not found" }, 404);
        }
        user = {
            id: Number(row.id),
            firstName: String(row.firstName),
            lastName: String(row.lastName),
            email: String(row.email),
        };
    } catch (err) {
        if (err instanceof Error && err.message.includes("UNIQUE")) {
            return c.json({ success: false, error: "Email is already in use" }, 409);
        }
        console.error("updateProfile DB error (update):", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }

    // 5) Notify email about the email change
    if (password) {

        sendEmail({
            to: user.email,
            name: `${user.firstName} ${user.lastName}`,
            title: "Password changed",
            templateId: process.env.EMAILJS_LOGIN_TEMPLATE_ID, 
            message: `The password of your Meowzeum account was changed on ${emilSendTime()}. If this was you, there is nothing else to do. If you did not change it, please contact us immediately.`,
        }).catch((err) => console.error("Password change email failed:", err));
    }

    // 6) New session 
    return createSessionResponse(c, user);
}