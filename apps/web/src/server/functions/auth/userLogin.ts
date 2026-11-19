import { createServerFn } from '@tanstack/react-start'
import { mutationOptions } from '@tanstack/react-query'
//import { GetSchema } from '@Meowzeum/shared-types'

type LoginInput = {
    email: string
    password: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginInput) => {
        if (!data.email || !data.password) {
            throw new Error('Email and password are required')
        }
        if (!emailRegex.test(data.email)) {
            throw new Error('Invalid email format')
        }
        return data
    })
    .handler(async ({ data }) => {
        const { email } = data
        return { success: true, email }
    })

export const loginUserMutation = () =>
    mutationOptions({
        mutationFn: (data: LoginInput) => loginUserFunc({ data }),
        onSuccess: (responseData, variables) => {
            console.log('Server response:', responseData.email)

            console.log('Sent email:', variables.email)
        },
        onError: (error, variables) => {
            console.error('Unsuccesfull login:', variables.email, error)
        }
    })
