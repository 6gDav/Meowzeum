import { createServerFn } from '@tanstack/react-start'
import { setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'
import { type RegistrationInput } from '@Meowzeum/shared-types'

const registerUserFunc = createServerFn({ method: 'POST' })
    .validator((data: RegistrationInput) => {
        if (!data.firstName || !data.lastName) {
            throw new Error('First name and last name are required')
        }
        if (!data.password || data.password.length < 8) {
            throw new Error('Password must be at least 8 characters')
        }
        if (data.password !== data.passwordConfirm) {
            throw new Error('Passwords do not match')
        }
        return data
    })
    .handler(async ({ data }) => {
        // Csak itt, a szerveroldali handlerben olvassuk ki őket!
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

        return { success: true, firstName: json.data.firstName as string }
    })

export const registerUserMutation = () =>
    mutationOptions({
        mutationFn: (data: RegistrationInput) => registerUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.firstName)
            console.log('Sent email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull registration:', variables.email, error)
        }
    })