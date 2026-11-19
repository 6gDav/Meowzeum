import { createServerFn } from '@tanstack/react-start'
import { mutationOptions } from '@tanstack/react-query'
//import { GetSchema } from '@Meowzeum/shared-types'

type RegistrationInput = {
    firstName: string
    lastName: string
    email: string
    password: string
    passwordConfirm: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const registerUserFunc = createServerFn({ method: 'POST' })
    .validator((data: RegistrationInput) => {
        if (!data.firstName || !data.lastName) {
            throw new Error('First name and last name are required')
        }
        if (!data.email || !emailRegex.test(data.email)) {
            throw new Error('Invalid email format')
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
        const { firstName } = data
        return { success: true, firstName }
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
