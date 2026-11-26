import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'
import { LoginInputSchema, type LoginInput, type SessionJWT } from '@Meowzeum/shared-types'


const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginInput) => LoginInputSchema.parse(data))
    .handler(async ({ data }): Promise<SessionJWT> => {
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
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.user.firstName)
            console.log('Sent email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull login:', variables.email, error)
        }
    })