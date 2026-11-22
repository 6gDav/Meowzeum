import { createClient } from "@libsql/client";

export const turso = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const JWT_SECRET = process.env.SECRET_JWT!;
export const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day