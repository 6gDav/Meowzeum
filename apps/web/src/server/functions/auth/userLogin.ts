import { createServerFn } from '@tanstack/react-start'
import { mutationOptions } from '@tanstack/react-query'
import { LoginUserSchema, type LoginUserInput } from '@Meowzeum/shared-types'
import { postAuthRequest } from './authApi'

const loginUserFunc = createServerFn({ method: 'POST' })
    .validator((data: LoginUserInput) => LoginUserSchema.parse(data))
    .handler(async ({ data }) => {
        return postAuthRequest('/auth/login', data)
    })

export const loginUserMutation = () =>
    mutationOptions({
        mutationFn: (data: LoginUserInput) => loginUserFunc({ data }),
    })
