import type { Context } from "hono";
import { turso } from "./helper/tursoClient";
import { getSessionUser } from "./helper/getSession";

export async function getMe(c: Context) {
    // 1) get user id from cokkie
    const result = await getSessionUser(c).catch(() =>
        c.json({ success: false, error: "Internal server error" }, 500)
    );

    if (typeof result !== "number") {
        return result;
    }

    let userId: number = result;

    // 2) Fetch user
    try {
        const result = await turso.execute({
            sql: `SELECT id, firstName, lastName, email, picture
                  FROM users WHERE id = ?`,
            args: [userId],
        });
        const row = result.rows[0];
        if (!row) {
            return c.json({ success: false, error: "User not found" }, 401);
        }

        const pictureBase64 =
            row.picture instanceof ArrayBuffer
                ? Buffer.from(row.picture).toString("base64")
                : null;

        return c.json(
            {
                success: true,
                data: {
                    firstName: String(row.firstName),
                    lastName: String(row.lastName),
                    email: String(row.email),
                    avatar: pictureBase64,
                },
            },
            200,
        );
    } catch (err) {
        console.error("getMe DB error:", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }
}