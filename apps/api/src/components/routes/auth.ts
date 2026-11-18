import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { LoginUserSchema, RegisterUserSchema } from '@Meowzeum/shared-types'
import limiter from '../rateLimiter'
import { authenticateUser, registerUser } from '../auth/userStore'

const authRouter = new Hono()

authRouter.post('/auth/register', limiter(10), zValidator('json', RegisterUserSchema), async (c) => {
  const user = await registerUser(c.req.valid('json'))

  if (!user) {
    return c.json({ success: false, message: 'An account with this email already exists.' }, 409)
  }

  return c.json({ success: true, user }, 201)
})

authRouter.post('/auth/login', limiter(10), zValidator('json', LoginUserSchema), async (c) => {
  const user = await authenticateUser(c.req.valid('json'))

  if (!user) {
    return c.json({ success: false, message: 'Invalid email or password.' }, 401)
  }

  return c.json({ success: true, user })
})

export default authRouter
