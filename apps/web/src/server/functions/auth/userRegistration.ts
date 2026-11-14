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

const registerUserFunc = createServerFn({ method: 'POST' })
    .validator((data: RegistrationInput) => data)
    .handler(async ({ data }) => {
        const { firstName, lastName, email, password, passwordConfirm } = data
        return { success: true, firstName }
    })

export const registerUserMutation = () =>
    mutationOptions({
        mutationFn: (data: RegistrationInput) => registerUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.firstName)

            console.log('Sended email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull registration:', variables.email, error)
        }
    })
