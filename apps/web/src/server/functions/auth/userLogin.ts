import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'

type LoginInput = {
    email: string
    password: string
}

const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginInput) => data)
    .handler(async ({ data }) => {
        const apiBaseUrl = (process.env.MEOWZEUM_API_URL ?? 'http://127.0.0.1:3001').replace(/\/+$/, '')
        const response = await fetch(`${apiBaseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })
        const result = await response.json() as {
            token?: string
            user?: { id: number; firstName: string; lastName: string }
            error?: string
        }

        if (!response.ok || !result.token || !result.user) {
            throw new Error(result.error ?? `The authentication API returned ${response.status}.`)
        }

        const secureAttribute = process.env.NODE_ENV === 'production' ? '; Secure' : ''
        setResponseHeader(
            'Set-Cookie',
            `meowzeum_session=${result.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800${secureAttribute}`,
        )

        return { user: result.user }
    })

export const loginUserMutation = () =>
    mutationOptions({
        mutationFn: (data: LoginInput) => loginUserFunc({ data }),
    })
