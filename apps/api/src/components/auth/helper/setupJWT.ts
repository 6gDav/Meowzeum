import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { JWT_SECRET, TOKEN_TTL_SECONDS } from "./tursoClient";
import type { SessionJWT } from "@Meowzeum/shared-types";

export interface SessionUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

export async function createSessionResponse(c: Context, user: SessionUser, status: ContentfulStatusCode = 200) {
    // 1) JWT + HttpOnly cookie
    const now = Math.floor(Date.now() / 1000);
    const token = await sign(
        { sub: String(user.id), email: user.email, iat: now, exp: now + TOKEN_TTL_SECONDS },
        JWT_SECRET,
    );

    setCookie(c, "token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: TOKEN_TTL_SECONDS,
    });

    // 2) Successful response
    const returnObject: SessionJWT = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    };

    return c.json(
        {
            success: true,
            data: returnObject,
        },
        status,
    );
}