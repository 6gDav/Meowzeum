import './mockEnv'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verify } from 'hono/jwt'
import { app } from '../../index'

const mockExecute = vi.hoisted(() => vi.fn())
const mockFetch = vi.hoisted(() => vi.fn())

vi.mock('@libsql/client', () => ({
  createClient: () => ({ execute: mockExecute })
}))
vi.stubGlobal('fetch', mockFetch)

const validUser = {
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'Jane.Doe@Company.com',
  password: 'Str0ngP@ssw0rd!',
  passwordConfirm: 'Str0ngP@ssw0rd!'
}

const dbUser = {
  id: 3,
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@company.com',
  password_hash: 'hashed:Str0ngP@ssw0rd!'
}

//every request gets a new IP to avoid the rate limiter
let ipCounter = 0
const post = (path: string, body: unknown, headers: Record<string, string> = {}) => {
  ipCounter++
  return app.request(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': 'test-key',
      'x-forwarded-for': `10.0.0.${ipCounter}`,
      ...headers
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
}

const getToken = (res: Response) => res.headers.get('set-cookie')?.match(/token=([^;]+)/)?.[1] ?? ''

beforeEach(() => {
  mockExecute.mockReset()
  mockFetch.mockReset()
  mockFetch.mockImplementation(async () => new Response('OK'))
})

///middlewares
describe('POST /auth/* middlewares', () => {
  it('Returns 403 without the internal key', async () => {
    const res = await post('/auth/login', {}, { 'x-internal-key': '' })

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
  })

  it('Returns 403 with a wrong internal key', async () => {
    const res = await post('/auth/registration', validUser, { 'x-internal-key': 'wrong-key' })

    expect(res.status).toBe(403)
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 429 after too many requests from the same IP', async () => {
    mockExecute.mockResolvedValue({ rows: [] })
    const sameIp = { 'x-forwarded-for': '99.99.99.99' }
    const body = { email: 'jane@doe.com', password: 'pass' }

    for (let i = 0; i < 5; i++) {
      const res = await post('/auth/login', body, sameIp)
      expect(res.status).toBe(401)
    }
    const res = await post('/auth/login', body, sameIp)

    expect(res.status).toBe(429)
  })

  it('Does not allow cross-origin access on the auth routes', async () => {
    const res = await post('/auth/login', {}, { Origin: 'http://evil.com' })

    expect(res.headers.get('access-control-allow-origin')).toBeNull()
  })

  it('Keeps the public cors on the cat routes', async () => {
    const res = await app.request('/get-a-cat-info/Ragdoll', { headers: { Origin: 'http://example.com' } })

    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })
})

///auth/registration
describe('POST /auth/registration', () => {
  it('Successfully registers a new user', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    const res = await post('/auth/registration', validUser)

    expect(res.status).toBe(201)
    expect(await res.json()).toEqual({
      success: true,
      data: { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com' }
    })
  })

  it('Saves the lowercase email and the hashed password', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    await post('/auth/registration', validUser)

    const args = mockExecute.mock.calls[0]![0].args
    expect(args.slice(0, 4)).toEqual(['Jane', 'Doe', 'jane.doe@company.com', `hashed:${validUser.password}`])
    expect(args).not.toContain(validUser.password)
  })

  it('Sends a welcome email', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    await post('/auth/registration', validUser)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0]![1].body)
    expect(body.template_id).toBe('template-id')
    expect(body.template_params.to_email).toBe('jane.doe@company.com')
  })

  it('Does not send an email if the registration fails', async () => {
    const res = await post('/auth/registration', { ...validUser, passwordConfirm: 'Different123!' })

    expect(res.status).toBe(400)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('Does not return the password in the response', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    const res = await post('/auth/registration', validUser)
    const text = await res.text()

    expect(text).not.toContain(validUser.password)
    expect(text).not.toContain('password')
  })

  it('Sets a secure HttpOnly token cookie', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    const res = await post('/auth/registration', validUser)
    const cookie = res.headers.get('set-cookie')!

    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=None')
  })

  it('Puts the new user into the JWT token', async () => {
    mockExecute.mockResolvedValue({ lastInsertRowid: 7n, rows: [] })

    const res = await post('/auth/registration', validUser)
    const payload = await verify(getToken(res), 'test-secret', 'HS256')

    expect(payload.sub).toBe('7')
    expect(payload.email).toBe('jane.doe@company.com')
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))
  })

  it('Returns 400 if the body is not a valid JSON', async () => {
    const res = await post('/auth/registration', '{bad json')

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid JSON body' })
  })

  it('Returns 400 if the fields are missing', async () => {
    const res = await post('/auth/registration', {})

    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string; issues: Record<string, string[]> }
    expect(body.error).toBe('Validation failed')
    expect(Object.keys(body.issues)).toEqual(
      expect.arrayContaining(['firstName', 'lastName', 'email', 'password', 'passwordConfirm'])
    )
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 400 if the email is invalid', async () => {
    const res = await post('/auth/registration', { ...validUser, email: 'not-an-email' })

    expect(res.status).toBe(400)
    const body = (await res.json()) as { issues: Record<string, string[]> }
    expect(body.issues.email).toContain('Invalid email address')
  })

  it('Returns 400 if the passwords do not match', async () => {
    const res = await post('/auth/registration', { ...validUser, passwordConfirm: 'Different123!' })

    expect(res.status).toBe(400)
    const body = (await res.json()) as { issues: Record<string, string[]> }
    expect(body.issues.passwordConfirm).toContain('Passwords do not match')
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 400 if the password is too short', async () => {
    const res = await post('/auth/registration', { ...validUser, password: '1', passwordConfirm: '1' })

    expect(res.status).toBe(400)
    const body = (await res.json()) as { issues: Record<string, string[]> }
    expect(body.issues.password).toBeDefined()
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 409 if the email is already registered', async () => {
    mockExecute.mockRejectedValue(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email'))

    const res = await post('/auth/registration', validUser)

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ success: false, error: 'Email already registered' })
  })

  it('Returns 500 if the database fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockRejectedValue(new Error('connection lost'))

    const res = await post('/auth/registration', validUser)

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, error: 'Internal server error' })
    error.mockRestore()
  })
})

///auth/login
describe('POST /auth/login', () => {
  const validLogin = { email: 'jane.doe@company.com', password: 'Str0ngP@ssw0rd!' }

  it('Successfully logs in the user', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    const res = await post('/auth/login', validLogin)

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      data: { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com' }
    })
  })

  it('Sends a login notification email', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    await post('/auth/login', validLogin)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const body = JSON.parse(mockFetch.mock.calls[0]![1].body)
    expect(body.template_id).toBe('login-template-id')
    expect(body.template_params.title).toBe('New login')
    expect(body.template_params.to_email).toBe('jane.doe@company.com')
  })

  it('Does not send an email after a failed login', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    await post('/auth/login', { ...validLogin, password: 'WrongPassword1!' })

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('Still logs in if the email can not be sent', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockResolvedValue({ rows: [dbUser] })
    mockFetch.mockRejectedValue(new Error('network down'))

    const res = await post('/auth/login', validLogin)

    expect(res.status).toBe(200)
    error.mockRestore()
  })

  it('Does not return the password hash', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    const res = await post('/auth/login', validLogin)
    const text = await res.text()

    expect(text).not.toContain('password')
    expect(text).not.toContain('hashed')
  })

  it('Searches the user with the lowercase email', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    await post('/auth/login', { ...validLogin, email: 'JANE.Doe@Company.com' })

    expect(mockExecute.mock.calls[0]![0].args).toEqual(['jane.doe@company.com'])
  })

  it('Sets a secure HttpOnly token cookie with the user in the JWT', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    const res = await post('/auth/login', validLogin)
    const cookie = res.headers.get('set-cookie')!
    const payload = await verify(getToken(res), 'test-secret', 'HS256')

    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=None')
    expect(payload.sub).toBe('3')
    expect(payload.email).toBe('jane.doe@company.com')
  })

  it('Returns 401 with a wrong password', async () => {
    mockExecute.mockResolvedValue({ rows: [dbUser] })

    const res = await post('/auth/login', { ...validLogin, password: 'WrongPassword1!' })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid email or password' })
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('Returns the same 401 if the user does not exist', async () => {
    mockExecute.mockResolvedValue({ rows: [] })

    const res = await post('/auth/login', validLogin)

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid email or password' })
    expect(res.headers.get('set-cookie')).toBeNull()
  })

  it('Still checks a password if the user does not exist (timing)', async () => {
    mockExecute.mockResolvedValue({ rows: [] })
    const verifySpy = vi.spyOn(Bun.password, 'verify')

    await post('/auth/login', validLogin)

    expect(verifySpy).toHaveBeenCalled()
    verifySpy.mockRestore()
  })

  it('Returns 400 if the body is not a valid JSON', async () => {
    const res = await post('/auth/login', '{bad json')

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid JSON body' })
  })

  it('Returns 400 if the fields are missing', async () => {
    const res = await post('/auth/login', {})

    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string; issues: Record<string, string[]> }
    expect(body.error).toBe('Validation failed')
    expect(Object.keys(body.issues)).toEqual(expect.arrayContaining(['email', 'password']))
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 400 if the email is invalid', async () => {
    const res = await post('/auth/login', { ...validLogin, email: 'not-an-email' })

    expect(res.status).toBe(400)
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 400 if the password is not a string', async () => {
    const res = await post('/auth/login', { ...validLogin, password: 12345 })

    expect(res.status).toBe(400)
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 500 if the database fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockRejectedValue(new Error('connection lost'))

    const res = await post('/auth/login', validLogin)

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, error: 'Internal server error' })
    error.mockRestore()
  })
})
