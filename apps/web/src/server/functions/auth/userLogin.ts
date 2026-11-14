import { createServerFn } from '@tanstack/react-start'
import { mutationOptions } from '@tanstack/react-query'
//import { GetSchema } from '@Meowzeum/shared-types'

type LoginInput = {
    email: string
    password: string
}

const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginInput) => data)
    .handler(async ({ data }) => {
        const { email, password } = data
        return { success: true, email }
    })

export const loginUserMutation = () =>
    mutationOptions({
        mutationFn: (data: LoginInput) => loginUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.email)

            console.log('Sended email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull login:', variables.email, error)
        }
    })
