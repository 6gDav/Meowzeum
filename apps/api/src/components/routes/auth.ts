/*import { Hono } from 'hono'
import { db } from '../db'
import { createSessionToken, getSessionUserId } from '../authSession'

type UserRow = {
  id: number
  firstName: string
  lastName: string
  password_hash: string
}

function isRecord(value: unknown): value is Record<string, unknown>
{
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createAuthRouter()
{
  const router = new Hono()

  router.post('/auth/login', async (c) => {
    if (!c.req.header('content-type')?.includes('application/json')) {
      return c.json({ error: 'Content-Type must be application/json.' }, 415)
    }

    let rawBody: unknown
    try {
      rawBody = await c.req.json()
    }
    catch {
      return c.json({ error: 'Request body must be valid JSON.' }, 400)
    }

    if (!isRecord(rawBody) ||
        typeof rawBody.email !== 'string' ||
        typeof rawBody.password !== 'string' ||
        rawBody.email.length > 254 ||
        rawBody.password.length === 0) {
      return c.json({ error: 'A valid email and password are required.' }, 400)
    }

    const email = rawBody.email.trim()
    const user = await (await db.prepare(
      'SELECT id, firstName, lastName, password_hash FROM users WHERE email = ?',
    )).get([email]) as UserRow | undefined

    if (!user || !await Bun.password.verify(rawBody.password, user.password_hash)) {
      return c.json({ error: 'Email or password is incorrect.' }, 401)
    }

    return c.json({
      token: createSessionToken(user.id),
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName },
    })
  })

  router.get('/auth/session', async (c) => {
    const userId = getSessionUserId(c.req.header('cookie'))
    if (!userId) return c.json({ user: null })

    const user = await (await db.prepare(
      'SELECT id, firstName, lastName FROM users WHERE id = ?',
    )).get([userId]) as Omit<UserRow, 'password_hash'> | undefined

    return c.json({
      user: user
        ? { id: user.id, firstName: user.firstName, lastName: user.lastName }
        : null,
    })
  })

  return router
}
*/