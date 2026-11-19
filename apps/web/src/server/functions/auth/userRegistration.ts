import { createServerFn } from '@tanstack/react-start'
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