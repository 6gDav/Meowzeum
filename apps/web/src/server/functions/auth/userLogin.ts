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

        const INTERNAL_API_KEY = "CC0k/x0lwkYzOzDW6I1jKxqDHRmrYwb7T22oTUhiOYV8FG9P641GRzLRN6C6EDQA"//process.env.INTERNAL_API_KEY
        if (!INTERNAL_API_KEY) {
            throw new Error('INTERNAL_API_KEY is not set')
        }

        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).catch((err) => {
            console.error('Error during fetch:', err)
            throw new Error('Failed to connect to the authentication API.')
        })
        
        const result = await response.json() as {
            token?: string
            user?: { id: number; firstName: string; lastName: string, email: string }
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

        return { firstName: result.user.firstName, lastName: result.user.lastName, email: result.user.email }
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