import { createServerFn } from '@tanstack/react-start'
import { mutationOptions } from '@tanstack/react-query'
import { RegisterUserSchema, type RegisterUserInput } from '@Meowzeum/shared-types'
import { postAuthRequest } from './authApi'

type RegistrationInput = RegisterUserInput & {
    passwordConfirm: string
}

const registerUserFunc = createServerFn({ method: 'POST' })
    .validator((data: RegistrationInput) => {
        if (data.password !== data.passwordConfirm) {
            throw new Error('Passwords do not match.')
        }

        return RegisterUserSchema.parse(data)
    })
    .handler(async ({ data }) => {
        return postAuthRequest('/auth/register', data)
    })

export const registerUserMutation = () =>
    mutationOptions({
        mutationFn: (data: RegistrationInput) => registerUserFunc({ data }),
    })
