import { createClient } from "@libsql/client";
import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { sign } from "hono/jwt";
import { RegistrationInputSchema } from "@Meowzeum/shared-types";
import { join } from "path";

const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const JWT_SECRET = process.env.SECRET_JWT!;
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day

// Default avatar. (Costume avatar coming soon {or not})
const avatarPath = join(import.meta.dir, "../assets/default-avatar.png");
const DEFAULT_PICTURE = new Uint8Array(
    await Bun.file(avatarPath).arrayBuffer(),
);

export async function registrateUser(c: Context) {
    // 1) Validate Schenma
    let body: unknown;
    try {
        body = await c.req.json();
    } catch {
        return c.json({ success: false, error: "Invalid JSON body" }, 400);
    }

    const parsed = RegistrationInputSchema.safeParse(body);
    if (!parsed.success) {
        return c.json(
            { success: false, error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
            400,
        );
    }

    const { firstName, lastName, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    // 2) Argon2 Hashing
    const passwordHash = await Bun.password.hash(password);

    // 3) Insertion
    // const uuid = crypto.randomUUID();
    let userId: number;
    try {
        const result = await turso.execute({
            sql: `INSERT INTO users (firstName, lastName, email, password_hash, picture)
                  VALUES (?, ?, ?, ?, ?)`,
            // uuid later: ad to belove
            args: [firstName, lastName, normalizedEmail, passwordHash, DEFAULT_PICTURE],
        });
        userId = Number(result.lastInsertRowid);
    } catch (err: any) {
        if (String(err?.message).includes("UNIQUE")) {
            return c.json({ success: false, error: "Email already registered" }, 409);
        }
        console.error("registrateUser DB error:", err);
        return c.json({ success: false, error: "Internal server error" }, 500);
    }

    // 4) JWT + HttpOnly cookie
    const now = Math.floor(Date.now() / 1000);
    const token = await sign(
        { sub: String(userId) /* uuid later: sub: uuid */, email: normalizedEmail, iat: now, exp: now + TOKEN_TTL_SECONDS },
        JWT_SECRET,
    );

    setCookie(c, "token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
        maxAge: TOKEN_TTL_SECONDS,
    });

    // 5) Succesfull response
    return c.json(
        { success: true, data: { /*uuid,*/ firstName, lastName, email: normalizedEmail } },
        201,
    );
}