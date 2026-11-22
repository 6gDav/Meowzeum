import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { queryOptions } from '@tanstack/react-query'

export type AuthUser = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export const getCurrentUserFunc = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AuthUser | null> => {
    const cookieHeader = getRequestHeader('cookie')
    if (!cookieHeader) return null

    const API_URL =
      process.env.API_URL ??
      (process.env.NODE_ENV === 'production'
        ? 'https://meowzeum-api.onrender.com'
        : 'http://localhost:3001')

    const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
    if (!INTERNAL_API_KEY) throw new Error('INTERNAL_API_KEY is not set')

    const res = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        cookie: cookieHeader,
        'x-internal-key': INTERNAL_API_KEY,
      },
    })

    if (!res.ok) return null

    const json = await res.json().catch(() => null)
    return json?.success ? json.data : null
  }
)

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUserFunc(),
    staleTime: 1000 * 60 * 5,
  })