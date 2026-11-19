import { describe, it, expect, vi } from 'vitest'
import { loginUserMutation } from './userLogin'

const serverFnOptions = vi.hoisted(() => [] as unknown[])

vi.mock('@tanstack/react-start', () => ({
    createServerFn: (options: unknown) => {
        serverFnOptions.push(options)
        let validate = (data: unknown) => data
        const builder = {
            validator: (fn: (data: unknown) => unknown) => {
                validate = fn
                return builder
            },
            handler: (fn: (args: { data: unknown }) => unknown) =>
                async ({ data }: { data: unknown }) => fn({ data: validate(data) }),
        }
        return builder
    },
}))

const validLogin = {
    email: 'jane.doe@company.com',
    password: 'Str0ngP@ssw0rd!',
}

const callLogin = (input: object) => (loginUserMutation().mutationFn as any)(input)

///route
describe('Login server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Mutation function sends the data to the server function', async () => {
        const res = await callLogin(validLogin)
        expect(res).toEqual({ success: true, email: validLogin.email })
    })
})

///logic
describe('Login logic', () => {
    it('Successfully logs in with valid credentials', async () => {
        const res = await callLogin(validLogin)

        expect(res.success).toBe(true)
        expect(res.email).toBe(validLogin.email)
    })

    it('Does not return the password', async () => {
        const res = await callLogin(validLogin)

        expect(res).not.toHaveProperty('password')
    })

    it('Rejects an empty email', async () => {
        await expect(callLogin({ ...validLogin, email: '' })).rejects.toThrow()
    })

    it('Rejects an empty password', async () => {
        await expect(callLogin({ ...validLogin, password: '' })).rejects.toThrow()
    })

    it('Rejects a malformed email', async () => {
        await expect(callLogin({ ...validLogin, email: 'not-an-email' })).rejects.toThrow()
    })

    it('Rejects missing fields', async () => {
        await expect(callLogin({})).rejects.toThrow()
    })
})

///mutation callbacks
describe('Login mutation callbacks', () => {
    it('Logs the server response on success', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const mutation = loginUserMutation() as any

        mutation.onSuccess({ success: true, email: validLogin.email }, validLogin)

        expect(log).toHaveBeenCalledWith('Server response:', validLogin.email)
        log.mockRestore()
    })

    it('Logs the error on failure', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { })
        const mutation = loginUserMutation() as any
        const err = new Error('fail')

        mutation.onError(err, validLogin)

        expect(error).toHaveBeenCalledWith('Unsuccesfull login:', validLogin.email, err)
        error.mockRestore()
    })
})
