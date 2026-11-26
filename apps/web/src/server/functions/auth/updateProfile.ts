import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, setResponseHeader } from '@tanstack/react-start/server'
import { mutationOptions } from '@tanstack/react-query'
import { UpdateProfileInputSchema, type UpdateProfileInput } from '@Meowzeum/shared-types'

type UpdatedUser = {
    firstName: string
    lastName: string
    email: string
}

const updateProfileFunc = createServerFn({ method: 'POST' })
    .validator((data: UpdateProfileInput) => UpdateProfileInputSchema.parse(data))
    .handler(async ({ data }): Promise<UpdatedUser> => {
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

        const res = await fetch(`${API_URL}/profileChange`, { 
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': INTERNAL_API_KEY,
                cookie,
            },
            body: JSON.stringify(data),
        })

        const json = await res.json().catch(() => null)

        if (!res.ok || !json?.success) {
            throw new Error(json?.error ?? 'Profile update failed')
        }

        const cookies = res.headers.getSetCookie()
        if (cookies.length) setResponseHeader('Set-Cookie', cookies)

        return json.data
    })

export const updateProfileMutation = () =>
    mutationOptions({
        mutationFn: (data: UpdateProfileInput) => updateProfileFunc({ data }),
        onError: (error, variables) => {
            console.error('Profile update failed:', variables.email, error)
        },
    })