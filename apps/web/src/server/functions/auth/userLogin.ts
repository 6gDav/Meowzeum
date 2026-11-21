import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'
import { LoginInputSchema, type LoginInput } from '@Meowzeum/shared-types'

type LoginUser = { id: number; firstName: string; lastName: string; email: string }

const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginInput) => LoginInputSchema.parse(data))
    .handler(async ({ data }): Promise<LoginUser> => {
        const API_URL =
            process.env.API_URL ??
            (process.env.NODE_ENV === 'production'
                ? 'https://meowzeum-api.onrender.com'
                : 'http://localhost:3001')

        const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY
        if (!INTERNAL_API_KEY) {
            throw new Error('INTERNAL_API_KEY is not set')
        }

        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': INTERNAL_API_KEY,
            },
            body: JSON.stringify(data),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success) {
            throw new Error(json?.error ?? 'Login failed')
        }

        const cookies = res.headers.getSetCookie()
        if (cookies.length) setResponseHeader('Set-Cookie', cookies)

        return json.data
    })

export const loginUserMutation = () =>
    mutationOptions({
        mutationFn: (data: LoginInput) => loginUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.firstName)
            console.log('Sent email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull login:', variables.email, error)
        }
    })