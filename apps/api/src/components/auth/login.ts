import { createClient } from "@libsql/client";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { LoginInputSchema } from "@Meowzeum/shared-types";
import { turso } from '../db'

const JWT_SECRET = process.env.SECRET_JWT!;
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

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
    let user: { id: number; firstName: string; lastName: string; email: string; password_hash: string } | undefined;
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

    // 4) JWT + HttpOnly cookie
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

    // 5) Successful response
    return c.json(
        { success: true, data: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email } },
        200,
    );
}