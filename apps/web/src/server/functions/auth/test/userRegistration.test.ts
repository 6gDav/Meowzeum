import { describe, it, expect, vi } from 'vitest'
import { registerUserMutation } from './userRegistration'

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

const validUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    password: 'Str0ngP@ssw0rd!',
    passwordConfirm: 'Str0ngP@ssw0rd!',
}

const callRegister = (input: object) => (registerUserMutation().mutationFn as any)(input)

///route
describe('Registration server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Mutation function sends the data to the server function', async () => {
        const res = await callRegister(validUser)
        expect(res).toEqual({ success: true, firstName: validUser.firstName })
    })
})

///logic
describe('Registration logic', () => {
    it('Successfully registers a valid user', async () => {
        const res = await callRegister(validUser)

        expect(res.success).toBe(true)
        expect(res.firstName).toBe('Jane')
    })

    it('Does not return the passwords', async () => {
        const res = await callRegister(validUser)

        expect(res).not.toHaveProperty('password')
        expect(res).not.toHaveProperty('passwordConfirm')
    })

    it('Rejects an empty first name', async () => {
        await expect(callRegister({ ...validUser, firstName: '' })).rejects.toThrow()
    })

    it('Rejects an empty last name', async () => {
        await expect(callRegister({ ...validUser, lastName: '' })).rejects.toThrow()
    })

    it('Rejects a malformed email', async () => {
        await expect(callRegister({ ...validUser, email: 'not-an-email' })).rejects.toThrow()
    })

    it('Rejects if the passwords do not match', async () => {
        await expect(
            callRegister({ ...validUser, passwordConfirm: 'Different123!' })
        ).rejects.toThrow()
    })

    it('Rejects a too short password', async () => {
        await expect(
            callRegister({ ...validUser, password: 'short', passwordConfirm: 'short' })
        ).rejects.toThrow()
    })

    it('Rejects missing fields', async () => {
        await expect(callRegister({})).rejects.toThrow()
    })
})

///mutation callbacks
describe('Registration mutation callbacks', () => {
    it('Logs the server response on success', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const mutation = registerUserMutation() as any

        mutation.onSuccess({ success: true, firstName: validUser.firstName }, validUser)

        expect(log).toHaveBeenCalledWith('Server response:', validUser.firstName)
        log.mockRestore()
    })

    it('Logs the error on failure', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { })
        const mutation = registerUserMutation() as any
        const err = new Error('fail')

        mutation.onError(err, validUser)

        expect(error).toHaveBeenCalledWith('Unsuccesfull registration:', validUser.email, err)
        error.mockRestore()
    })
})
