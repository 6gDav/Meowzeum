import type { Context } from "hono";
import { deleteCookie } from "hono/cookie";

export function clearSessionResponse(c: Context) {
    deleteCookie(c, "token", {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
    });

    return c.json(
        {
            success: true,
            data: null,
        },
        200,
    );
}