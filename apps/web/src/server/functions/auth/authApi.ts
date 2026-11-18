import { AuthResponseSchema, type AuthResponse } from '@Meowzeum/shared-types'

type AuthPath = '/auth/login' | '/auth/register'

export async function postAuthRequest(path: AuthPath, payload: object): Promise<AuthResponse> {
  const apiUrl = process.env.MEOWZEUM_API_URL ?? 'http://127.0.0.1:3001'
  const response = await fetch(new URL(path, apiUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const responseBody: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      typeof responseBody === 'object' &&
      responseBody !== null &&
      'message' in responseBody &&
      typeof responseBody.message === 'string'
        ? responseBody.message
        : 'Authentication request failed.'
    throw new Error(message)
  }

  return AuthResponseSchema.parse(responseBody)
}
