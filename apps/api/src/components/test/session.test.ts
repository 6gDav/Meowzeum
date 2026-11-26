import './mockEnv'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sign } from 'hono/jwt'
import { app } from '../../index'

const mockExecute = vi.hoisted(() => vi.fn())
const mockFetch = vi.hoisted(() => vi.fn())

vi.mock('@libsql/client', () => ({
  createClient: () => ({ execute: mockExecute })
}))
vi.stubGlobal('fetch', mockFetch)

const makeToken = (sub: string = '3', secret: string = 'test-secret', exp?: number) => {
  const now = Math.floor(Date.now() / 1000)
  return sign({ sub, email: 'jane.doe@company.com', iat: now, exp: exp ?? now + 3600 }, secret)
}

//every request gets a new IP to avoid the rate limiter
let ipCounter = 0
const request = async (
  method: string,
  path: string,
  options: { body?: unknown; token?: string | null; headers?: Record<string, string> } = {}
) => {
  ipCounter++
  const token = options.token === undefined ? await makeToken() : options.token
  return app.request(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-key': 'test-key',
      'x-forwarded-for': `10.1.0.${ipCounter}`,
      ...(token ? { Cookie: `token=${token}` } : {}),
      ...options.headers
    },
    body: options.body === undefined ? undefined : typeof options.body === 'string' ? options.body : JSON.stringify(options.body)
  })
}

const validUpdate = { firstName: 'Janet', lastName: 'Smith', email: 'Janet.Smith@Company.com' }
const updatedRow = { id: 3, firstName: 'Janet', lastName: 'Smith', email: 'janet.smith@company.com' }

beforeEach(() => {
  mockExecute.mockReset()
  mockFetch.mockReset()
  mockFetch.mockImplementation(async () => new Response('OK'))
})

///session check (every protected route)
describe('Protected /auth routes session check', () => {
  const protectedRoutes: [string, string][] = [
    ['GET', '/auth/me'],
    ['PATCH', '/auth/profileChange'],
    ['DELETE', '/auth/profileDelete']
  ]

  it.each(protectedRoutes)('%s %s returns 401 without a token', async (method, path) => {
    const res = await request(method, path, { token: null })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'Not authenticated' })
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it.each(protectedRoutes)('%s %s returns 401 with a garbage token', async (method, path) => {
    const res = await request(method, path, { token: 'not.a.jwt' })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid or expired token' })
  })

  it.each(protectedRoutes)('%s %s returns 401 with a token signed by another secret', async (method, path) => {
    const res = await request(method, path, { token: await makeToken('3', 'other-secret') })

    expect(res.status).toBe(401)
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it.each(protectedRoutes)('%s %s returns 401 with an expired token', async (method, path) => {
    const expired = Math.floor(Date.now() / 1000) - 60
    const res = await request(method, path, { token: await makeToken('3', 'test-secret', expired) })

    expect(res.status).toBe(401)
  })

  it.each(protectedRoutes)('%s %s returns 401 if the token subject is not a valid id', async (method, path) => {
    const res = await request(method, path, { token: await makeToken('abc') })

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid token' })
  })

  it.each(protectedRoutes)('%s %s returns 403 without the internal key', async (method, path) => {
    const res = await request(method, path, { headers: { 'x-internal-key': '' } })

    expect(res.status).toBe(403)
  })
})

///GET /auth/me
describe('GET /auth/me', () => {
  it('Returns the current user', async () => {
    mockExecute.mockResolvedValue({
      rows: [{ id: 3, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com', picture: null }]
    })

    const res = await request('GET', '/auth/me')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      data: { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com', avatar: null }
    })
  })

  it('Searches the user by the id from the token', async () => {
    mockExecute.mockResolvedValue({ rows: [] })

    await request('GET', '/auth/me', { token: await makeToken('42') })

    expect(mockExecute.mock.calls[0]![0].args).toEqual([42])
  })

  it('Returns the avatar as base64', async () => {
    const picture = new Uint8Array([1, 2, 3, 4]).buffer
    mockExecute.mockResolvedValue({
      rows: [{ id: 3, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com', picture }]
    })

    const res = await request('GET', '/auth/me')
    const body = (await res.json()) as { data: { avatar: string } }

    expect(body.data.avatar).toBe('AQIDBA==')
  })

  it('Does not return the password hash', async () => {
    mockExecute.mockResolvedValue({
      rows: [{ id: 3, firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com', picture: null, password_hash: 'secret' }]
    })

    const res = await request('GET', '/auth/me')

    expect(await res.text()).not.toContain('secret')
  })

  it('Returns 401 if the user does not exist anymore', async () => {
    mockExecute.mockResolvedValue({ rows: [] })

    const res = await request('GET', '/auth/me')

    expect(res.status).toBe(401)
    expect(await res.json()).toEqual({ success: false, error: 'User not found' })
  })

  it('Returns 500 if the database fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockRejectedValue(new Error('connection lost'))

    const res = await request('GET', '/auth/me')

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, error: 'Internal server error' })
    error.mockRestore()
  })
})

///POST /auth/logout
describe('POST /auth/logout', () => {
  it('Returns success', async () => {
    const res = await request('POST', '/auth/logout')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, data: null })
  })

  it('Expires the token cookie', async () => {
    const res = await request('POST', '/auth/logout')
    const cookie = res.headers.get('set-cookie')!

    expect(cookie).toContain('token=;')
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=None')
  })

  it('Works without a session too', async () => {
    const res = await request('POST', '/auth/logout', { token: null })

    expect(res.status).toBe(200)
  })

  it('Returns 403 without the internal key', async () => {
    const res = await request('POST', '/auth/logout', { headers: { 'x-internal-key': 'wrong' } })

    expect(res.status).toBe(403)
  })
})

///PATCH /auth/profileChange
describe('PATCH /auth/profileChange', () => {
  it('Successfully updates the profile', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({
      success: true,
      data: { firstName: 'Janet', lastName: 'Smith', email: 'janet.smith@company.com' }
    })
  })

  it('Saves the lowercase email for the logged in user', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(mockExecute.mock.calls[0]![0].args).toEqual(['janet.smith@company.com', 3])
    expect(mockExecute.mock.calls[1]![0].args).toEqual(['Janet', 'Smith', 'janet.smith@company.com', 3])
  })

  it('Does not touch the password if it is not sent', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(mockExecute.mock.calls[1]![0].sql).not.toContain('password_hash')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('Hashes the new password and sends an email about it', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    const res = await request('PATCH', '/auth/profileChange', { body: { ...validUpdate, password: 'NewStr0ngP@ss!' } })
    const update = mockExecute.mock.calls[1]![0]

    expect(res.status).toBe(200)
    expect(update.sql).toContain('password_hash = ?')
    expect(update.args).toEqual(['Janet', 'Smith', 'janet.smith@company.com', 'hashed:NewStr0ngP@ss!', 3])
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const emailBody = JSON.parse(mockFetch.mock.calls[0]![1].body)
    expect(emailBody.template_params.title).toBe('Password changed')
    expect(emailBody.template_params.to_email).toBe('janet.smith@company.com')
  })

  it('Does not return the password in the response', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    const res = await request('PATCH', '/auth/profileChange', { body: { ...validUpdate, password: 'NewStr0ngP@ss!' } })

    expect(await res.text()).not.toContain('NewStr0ngP@ss!')
  })

  it('Sets a new session cookie with the new email', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })
    const cookie = res.headers.get('set-cookie')!

    expect(cookie).toContain('token=')
    expect(cookie).toContain('HttpOnly')
  })

  it('Still succeeds if the password email can not be sent', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockFetch.mockRejectedValue(new Error('network down'))
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [updatedRow] })

    const res = await request('PATCH', '/auth/profileChange', { body: { ...validUpdate, password: 'NewStr0ngP@ss!' } })

    expect(res.status).toBe(200)
    error.mockRestore()
  })

  it('Returns 400 if the body is not a valid JSON', async () => {
    const res = await request('PATCH', '/auth/profileChange', { body: '{bad json' })

    expect(res.status).toBe(400)
    expect(await res.json()).toEqual({ success: false, error: 'Invalid JSON body' })
  })

  it('Returns 400 if the fields are missing', async () => {
    const res = await request('PATCH', '/auth/profileChange', { body: {} })

    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string; issues: Record<string, string[]> }
    expect(body.error).toBe('Validation failed')
    expect(Object.keys(body.issues)).toEqual(expect.arrayContaining(['firstName', 'lastName', 'email']))
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 400 if the email is invalid', async () => {
    const res = await request('PATCH', '/auth/profileChange', { body: { ...validUpdate, email: 'not-an-email' } })

    expect(res.status).toBe(400)
  })

  it('Returns 400 if the new password is too short', async () => {
    const res = await request('PATCH', '/auth/profileChange', { body: { ...validUpdate, password: 'short' } })

    expect(res.status).toBe(400)
    expect(mockExecute).not.toHaveBeenCalled()
  })

  it('Returns 409 if another user already has the email', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [{ id: 9 }] })

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ success: false, error: 'Email is already in use' })
    expect(mockExecute).toHaveBeenCalledTimes(1)
  })

  it('Returns 409 if the database rejects a duplicate email during the update', async () => {
    mockExecute
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error('SQLITE_CONSTRAINT: UNIQUE constraint failed: users.email'))

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(409)
    expect(await res.json()).toEqual({ success: false, error: 'Email is already in use' })
  })

  it('Returns 404 if the user does not exist anymore', async () => {
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [] })

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ success: false, error: 'User not found' })
  })

  it('Returns 500 if the email check fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockRejectedValueOnce(new Error('connection lost'))

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(500)
    error.mockRestore()
  })

  it('Returns 500 if the update fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockResolvedValueOnce({ rows: [] }).mockRejectedValueOnce(new Error('connection lost'))

    const res = await request('PATCH', '/auth/profileChange', { body: validUpdate })

    expect(res.status).toBe(500)
    expect(await res.json()).toEqual({ success: false, error: 'Internal server error' })
    error.mockRestore()
  })
})

///DELETE /auth/profileDelete
describe('DELETE /auth/profileDelete', () => {
  const deletedRow = { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com' }

  it('Successfully deletes the account', async () => {
    mockExecute.mockResolvedValue({ rows: [deletedRow] })

    const res = await request('DELETE', '/auth/profileDelete')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
  })

  it('Deletes only the logged in user', async () => {
    mockExecute.mockResolvedValue({ rows: [deletedRow] })

    await request('DELETE', '/auth/profileDelete', { token: await makeToken('42') })

    expect(mockExecute.mock.calls[0]![0].args).toEqual([42])
  })

  it('Expires the token cookie', async () => {
    mockExecute.mockResolvedValue({ rows: [deletedRow] })

    const res = await request('DELETE', '/auth/profileDelete')
    const cookie = res.headers.get('set-cookie')!

    expect(cookie).toContain('token=;')
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain('HttpOnly')
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=None')
  })

  it('Sends an email about the deletion', async () => {
    mockExecute.mockResolvedValue({ rows: [deletedRow] })

    await request('DELETE', '/auth/profileDelete')

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const emailBody = JSON.parse(mockFetch.mock.calls[0]![1].body)
    expect(emailBody.template_params.title).toBe('Account deleted')
    expect(emailBody.template_params.to_email).toBe('jane.doe@company.com')
  })

  it('Still succeeds if the email can not be sent', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockFetch.mockRejectedValue(new Error('network down'))
    mockExecute.mockResolvedValue({ rows: [deletedRow] })

    const res = await request('DELETE', '/auth/profileDelete')

    expect(res.status).toBe(200)
    error.mockRestore()
  })

  it('Returns 404 if the user does not exist anymore', async () => {
    mockExecute.mockResolvedValue({ rows: [] })

    const res = await request('DELETE', '/auth/profileDelete')

    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ success: false, error: 'User not found' })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('Returns 500 if the database fails and keeps the cookie', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => { })
    mockExecute.mockRejectedValue(new Error('connection lost'))

    const res = await request('DELETE', '/auth/profileDelete')

    expect(res.status).toBe(500)
    expect(res.headers.get('set-cookie')).toBeNull()
    error.mockRestore()
  })
})
