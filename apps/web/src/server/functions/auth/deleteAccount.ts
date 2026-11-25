import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'

const deleteProfileFunc = createServerFn({ method: 'POST' }).handler(
    async (): Promise<{ success: true }> => {
        const API_URL =
            process.env.API_URL ??
            (process.env.NODE_ENV === 'production'
                ? 'https://meowzeum-api.onrender.com'
                : 'http://localhost:3001')

        const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
        if (!INTERNAL_API_KEY) {
            throw new Error('INTERNAL_API_KEY is not set')
        }

        const cookie = getRequestHeader('cookie') ?? ''

        const res = await fetch(`${API_URL}/auth/profileDelete`, {
            method: 'DELETE',
            headers: {
                'x-internal-key': INTERNAL_API_KEY,
                cookie,
            },
        })

        const json = await res.json().catch(() => null)

        if (!res.ok || (json && json.success === false)) {
            throw new Error(json?.error ?? 'Profile deletion failed')
        }

        const cookies = res.headers.getSetCookie()
        if (cookies.length) setResponseHeader('Set-Cookie', cookies)

        return { success: true }
    },
)

export const deleteProfileMutation = () =>
    mutationOptions({
        mutationFn: () => deleteProfileFunc(),
        onError: (error) => {
            console.error('Profile deletion failed:', error)
        },
    })