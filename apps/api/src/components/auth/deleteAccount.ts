import type { Context } from "hono";
import { deleteCookie } from "hono/cookie";
import { turso } from "./helper/tursoClient";
import { getSessionUser } from "./helper/getSession";
import { sendEmail } from "./helper/sendEmail";
import { emilSendTime } from "./helper/getCurretnTime";

export async function deleteProfile(c: Context) {
    // 1) get user id
    const auth = await getSessionUser(c).catch(() =>
        c.json({ success: false, error: "Internal server error" }, 500),
    );

    if (typeof auth !== "number") {
        return auth;
    }

    const userId: number = auth;

    // 2) Delete the user; RETURNING gives back the data needed for the email
    let user: { firstName: string; lastName: string; email: string };

    try {
        const result = await turso.execute({
            sql: `DELETE FROM users
                  WHERE id = ?
                  RETURNING firstName, lastName, email`,
            args: [userId],
        });

        const row = result.rows[0];
        if (!row) {
            return c.json({ success: false, error: "User not found" }, 404);
        }

        user = {
            firstName: String(row.firstName),
            lastName: String(row.lastName),
            email: String(row.email),
        };
    } catch (err) {
        console.error("deleteProfile DB error:", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }

    // 3) Expire the session cookie
    deleteCookie(c, "token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
    });

    // 4) Notify by email about the account deletion
    sendEmail({
        to: user.email,
        name: `${user.firstName} ${user.lastName}`,
        title: "Account deleted",
        templateId: process.env.EMAILJS_LOGIN_TEMPLATE_ID, 
        message: `Your Meowzeum account was deleted on ${emilSendTime()}, together with all your posts. If this was you, there is nothing else to do. If you did not do this, please contact us immediately.`,
    }).catch((err) => console.error("Account deletion email failed:", err));

    return c.json({ success: true });
}