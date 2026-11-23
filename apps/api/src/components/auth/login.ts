import type { Context } from "hono";
import { LoginInputSchema } from "@Meowzeum/shared-types";
import { turso } from "./helper/tursoClient";
import { createSessionResponse } from "./helper/setupJWT";
import { sendEmail } from "./helper/sendEmail";


//secure dummy hash
const DUMMY_HASH = await Bun.password.hash("dummy-password-for-timing");

const INVALID_CREDENTIALS = { success: false, error: "Invalid email or password" };

export async function loginUser(c: Context) {
    // 1) Validate schema
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ success: false, error: "Invalid JSON body" }, 400);
    }

    const parsed = LoginInputSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
            400,
        );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 2) Find user
    let user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        password_hash: string
    } | undefined;

    try {
        const result = await turso.execute({
            sql: `SELECT id, firstName, lastName, email, password_hash
                  FROM users WHERE email = ?`,
            args: [normalizedEmail],
        });
        const row = result.rows[0];
        if (row) {
            user = {
                id: Number(row.id),
                firstName: String(row.firstName),
                lastName: String(row.lastName),
                email: String(row.email),
                password_hash: String(row.password_hash),
            };
        }
    } catch (err) {
        console.error("loginUser DB error:", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }

    // 3) Argon2 verify 
    const passwordOk = await Bun.password.verify(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !passwordOk) {
        return c.json(INVALID_CREDENTIALS, 401);
    }

    // 4) send email
    const loginTime = new Date().toLocaleString("en-GB", {
        timeZone: "Europe/Budapest",
        dateStyle: "medium",
        timeStyle: "short",
    });

    sendEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        templateId: process.env.EMAILJS_LOGIN_TEMPLATE_ID,
        message: `We noticed a new login to your Meowzeum account on ${loginTime}. If this was you, there is nothing else to do and you can happily continue browsing the gallery. If you did not log in, please change your password as soon as possible.`,
    }).catch((err) => console.error("Login email failed:", err));

    return createSessionResponse(c, user);
}