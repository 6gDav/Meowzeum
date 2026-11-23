import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'
import {
    RegistrationInputSchema,
    SessionJWTSchema,
    type RegistrationInput,
    type SessionJWT,
} from '@Meowzeum/shared-types'

const registerUserFunc = createServerFn({ method: 'POST' })
    .validator((data: RegistrationInput) => RegistrationInputSchema.parse(data))
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

        const res = await fetch(`${API_URL}/auth/registration`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': INTERNAL_API_KEY,
            },
            body: JSON.stringify(data),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok) {
            throw new Error(json?.error ?? 'Registration failed')
        }

        const cookies = res.headers.getSetCookie()
        if (cookies.length > 0) {
            setResponseHeader('Set-Cookie', cookies)
        }

        return SessionJWTSchema.parse(json?.data)
    })

export const registerUserMutation = () =>
    mutationOptions({
        mutationFn: (data: RegistrationInput) => registerUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.firstName, responseData.lastName)
            console.log('Sent email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccessful registration:', variables.email, error)
        },
    })