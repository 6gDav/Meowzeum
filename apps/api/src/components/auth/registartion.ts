import type { Context } from "hono";
import { RegistrationInputSchema } from "@Meowzeum/shared-types";
import { join } from "path";
import { turso } from "./helper/tursoClient";
import { createSessionResponse, type SessionUser } from "./helper/setupJWT";

// Default avatar. (Costume avatar coming soon {or not})
const avatarPath = join(import.meta.dirname, "../assets/default-avatar.png");
const DEFAULT_PICTURE = new Uint8Array(
    await Bun.file(avatarPath).arrayBuffer(),
);

export async function registrateUser(c: Context) {
    // 1) Validate Schema
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
    let userId: number;
    try {
        const result = await turso.execute({
            sql: `INSERT INTO users (firstName, lastName, email, password_hash, picture)
                  VALUES (?, ?, ?, ?, ?)`,
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

    // create return 
    const user: SessionUser = {
        id: userId,
        firstName,
        lastName,
        email: normalizedEmail,
        //avatar: 
    };

    return createSessionResponse(c, user, 201);
}