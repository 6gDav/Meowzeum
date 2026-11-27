import { createHmac, timingSafeEqual } from 'node:crypto'

export const sessionCookieName = 'meowzeum_session'

const sessionLifetimeSeconds = 60 * 60 * 24 * 7

function getSessionSecret(): string
{
    const secret = process.env.COMMUNITY_SESSION_SECRET
    if (!secret) throw new Error('COMMUNITY_SESSION_SECRET must be configured.')
    if (Buffer.byteLength(secret) < 32) {
        throw new Error('COMMUNITY_SESSION_SECRET must be at least 32 bytes long.')
    }
    return secret
}

export function createSessionToken(userId: number): string
{
    const expiresAt = Math.floor(Date.now() / 1000) + sessionLifetimeSeconds
    const payload = `${userId}.${expiresAt}`
    const signature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')

    return `${payload}.${signature}`
}

export function getSessionUserId(cookieHeader: string | undefined): number | null
{
    if (!cookieHeader) return null

    const cookie = cookieHeader.split(';').map((part) => part.trim())
      .find((part) => part.startsWith(`${sessionCookieName}=`))
    if (!cookie) return null

    const token = cookie.slice(sessionCookieName.length + 1)
    const [userIdValue, expiresAtValue, signature, ...rest] = token.split('.')
    if (!userIdValue || !expiresAtValue || !signature || rest.length > 0) return null

    const userId = Number(userIdValue)
    const expiresAt = Number(expiresAtValue)
    if (!Number.isSafeInteger(userId) || userId <= 0 ||
        !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
        return null
    }

    const payload = `${userId}.${expiresAt}`
    const expectedSignature = createHmac('sha256', getSessionSecret()).update(payload).digest('base64url')
    const actualBuffer = Buffer.from(signature)
    const expectedBuffer = Buffer.from(expectedSignature)
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null

    return userId
}
