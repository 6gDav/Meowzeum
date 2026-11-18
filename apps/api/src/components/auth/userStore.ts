import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Database } from 'bun:sqlite'
import type { AuthUser, LoginUserInput, RegisterUserInput } from '@Meowzeum/shared-types'

type StoredUser = AuthUser & {
  password_hash: string
}

const databasePath = process.env.MEOWZEUM_DB_PATH
  ? resolve(process.env.MEOWZEUM_DB_PATH)
  : fileURLToPath(new URL('../../../data/meowzeum.sqlite', import.meta.url))

mkdirSync(dirname(databasePath), { recursive: true })

const database = new Database(databasePath)

database.run('PRAGMA busy_timeout = 5000')
database.run(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  )
`)

export async function registerUser(input: RegisterUserInput): Promise<AuthUser | null> {
  const id = crypto.randomUUID()
  const passwordHash = await Bun.password.hash(input.password)
  const result = database.query(`
    INSERT OR IGNORE INTO users (id, firstName, lastName, email, password_hash, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, input.firstName, input.lastName, input.email, passwordHash, new Date().toISOString())

  if (result.changes === 0) {
    return null
  }

  return {
    id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
  }
}

export async function authenticateUser(input: LoginUserInput): Promise<AuthUser | null> {
  const user = database.query<StoredUser, [string]>(`
    SELECT id, firstName, lastName, email, password_hash
    FROM users
    WHERE email = ?
  `).get(input.email)

  if (!user || !(await Bun.password.verify(input.password, user.password_hash))) {
    return null
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  }
}
