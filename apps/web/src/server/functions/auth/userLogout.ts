import { createServerFn } from '@tanstack/react-start'
import {
    getRequestHeader,
    setResponseHeader,
    deleteCookie,
} from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'

const logoutUserFunc = createServerFn({ method: 'POST' }).handler(
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

        try {
            const res = await fetch(`${API_URL}/auth/logout`, {
                method: 'POST',
                headers: {
                    'x-internal-key': INTERNAL_API_KEY,
                    cookie: getRequestHeader('cookie') ?? '',
                },
            })

            const cookies = res.headers.getSetCookie()
            if (cookies.length) setResponseHeader('Set-Cookie', cookies)

            if (!res.ok) {
                throw new Error('Logout failed')
            }
        } catch (err) {
            deleteCookie('token', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
            })
            console.error('Logout upstream error:', err)
        }

        return { success: true }
    },
)

export const logoutUserMutation = () =>
    mutationOptions({
        mutationFn: () => logoutUserFunc(),
        onError: (error) => {
            console.error('Unsuccessful logout:', error)
        },
    })