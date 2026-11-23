import type { Context } from "hono";
import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { JWT_SECRET, turso } from "./helper/tursoClient";

export async function getMe(c: Context) {
    // 1) Accept or reject cokkie
    const token = getCookie(c, "token");
    if (!token) {
        return c.json({ success: false, error: "Not authenticated" }, 401);
    }

    // 2) Validate JWT
    let userId: number;
    try {
        const payload = await verify(token, JWT_SECRET, "HS256");
        userId = Number(payload.sub);
        if (!Number.isInteger(userId) || userId <= 0) {
            return c.json({ success: false, error: "Invalid token" }, 401);
        }
    } catch {
        return c.json({ success: false, error: "Invalid or expired token" }, 401);
    }

    // 3) Fetch user
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
                    picture: pictureBase64,
                },
            },
            200,
        );
    } catch (err) {
        console.error("getMe DB error:", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }
}