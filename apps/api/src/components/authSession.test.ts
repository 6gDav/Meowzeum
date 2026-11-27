import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSessionToken, getSessionUserId, sessionCookieName } from './authSession'

const originalSecret = process.env.COMMUNITY_SESSION_SECRET

describe('community session tokens', () => {
  beforeEach(() => {
    process.env.COMMUNITY_SESSION_SECRET = 'test-session-secret-with-at-least-32-bytes'
  })

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.COMMUNITY_SESSION_SECRET
    else process.env.COMMUNITY_SESSION_SECRET = originalSecret
  })

  it('resolves the signed database user id from the session cookie', () => {
    const token = createSessionToken(42)

    expect(getSessionUserId(`${sessionCookieName}=${token}`)).toBe(42)
  })

  it('rejects tampered, expired, and absent sessions', () => {
    const token = createSessionToken(42)
    const [userId, expiresAt, signature] = token.split('.')

    expect(getSessionUserId(`${sessionCookieName}=${userId}.${expiresAt}.${signature}x`)).toBeNull()
    expect(getSessionUserId(`${sessionCookieName}=42.1.invalid`)).toBeNull()
    expect(getSessionUserId(undefined)).toBeNull()
  })
})
