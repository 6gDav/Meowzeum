import { describe, expect, it } from 'vitest'
import { AuthResponseSchema } from '@Meowzeum/shared-types'
import { app } from '../../index'

describe('authentication endpoints', () => {
  it('registers users, rejects duplicate emails, and verifies login credentials', async () => {
    const email = `auth-${crypto.randomUUID()}@example.com`
    const registration = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: email.toUpperCase(),
      password: 'a-secure-password',
    }

    const registerResponse = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registration),
    })

    expect(registerResponse.status).toBe(201)
    const registered = AuthResponseSchema.parse(await registerResponse.json())
    expect(registered).toMatchObject({
      success: true,
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        email,
      },
    })
    expect(registered.user).not.toHaveProperty('password')
    expect(registered.user).not.toHaveProperty('password_hash')

    const duplicateResponse = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...registration, email }),
    })
    expect(duplicateResponse.status).toBe(409)

    const loginResponse = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: registration.password }),
    })
    expect(loginResponse.status).toBe(200)
    expect(await loginResponse.json()).toMatchObject({
      success: true,
      user: { email },
    })

    const invalidLoginResponse = await app.request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'incorrect-password' }),
    })
    expect(invalidLoginResponse.status).toBe(401)
  })

  it('rejects invalid registration input', async () => {
    const response = await app.request('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        password: 'short',
      }),
    })

    expect(response.status).toBe(400)
  })
})
