import type { Context } from "hono";
import { verify } from "hono/jwt";
import { JWT_SECRET } from "./tursoClient";
import { getCookie } from "hono/cookie";

export async function getSessionUser(c: Context): Promise<number | Response> {
    const token = getCookie(c, "token")
    if (!token) {
        return c.json({ success: false, error: "Not authenticated" }, 401);
    }

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

    return userId;
}