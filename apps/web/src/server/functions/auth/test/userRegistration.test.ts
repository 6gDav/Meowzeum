import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerUserMutation } from '../userRegistration'

const serverFnOptions = vi.hoisted(() => [] as unknown[])
const setResponseHeader = vi.hoisted(() => vi.fn())

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

vi.mock('@tanstack/react-start/server', () => ({ setResponseHeader }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const validUser = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@company.com',
    password: 'Str0ngP@ssw0rd!',
    passwordConfirm: 'Str0ngP@ssw0rd!',
}

const apiUser = { firstName: 'Jane', lastName: 'Doe', email: validUser.email }

const apiResponse = (body: unknown, status = 201, cookies: string[] = []) => {
    const headers = new Headers()
    cookies.forEach((cookie) => headers.append('set-cookie', cookie))
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })
}

const callRegister = (input: object) => (registerUserMutation().mutationFn as any)(input)

beforeEach(() => {
    mockFetch.mockReset()
    setResponseHeader.mockReset()
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
})

///route
describe('Registration server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Sends the data to the backend registration endpoint', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await callRegister(validUser)

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/registration')
        expect(options.method).toBe('POST')
        expect(options.headers['x-internal-key']).toBe('test-key')
        expect(JSON.parse(options.body)).toEqual(validUser)
    })
})

///logic
describe('Registration logic', () => {
    it('Successfully registers a valid user', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        const res = await callRegister(validUser)

        expect(res).toEqual(apiUser)
    })

    it('Throws if the backend sends a wrong user data', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: { firstName: 'Jane' } }))

        await expect(callRegister(validUser)).rejects.toThrow()
    })

    it('Throws if the backend sends no user data', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true }))

        await expect(callRegister(validUser)).rejects.toThrow()
    })

    it('Does not return the passwords', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        const res = await callRegister(validUser)

        expect(res).not.toHaveProperty('password')
        expect(res).not.toHaveProperty('passwordConfirm')
    })

    it('Forwards the cookie of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }, 201, ['token=abc; HttpOnly']))

        await callRegister(validUser)

        expect(setResponseHeader).toHaveBeenCalledWith('Set-Cookie', ['token=abc; HttpOnly'])
    })

    it('Does not set a cookie if the backend did not send one', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await callRegister(validUser)

        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws the error message of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false, error: 'Email already registered' }, 409))

        await expect(callRegister(validUser)).rejects.toThrow('Email already registered')
    })

    it('Throws a default error if the backend answer is not a JSON', async () => {
        mockFetch.mockResolvedValue(apiResponse('Bad Gateway', 502))

        await expect(callRegister(validUser)).rejects.toThrow('Registration failed')
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(callRegister(validUser)).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty first name without calling the backend', async () => {
        await expect(callRegister({ ...validUser, firstName: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty last name without calling the backend', async () => {
        await expect(callRegister({ ...validUser, lastName: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects a malformed email without calling the backend', async () => {
        await expect(callRegister({ ...validUser, email: 'not-an-email' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects if the passwords do not match without calling the backend', async () => {
        await expect(
            callRegister({ ...validUser, passwordConfirm: 'Different123!' })
        ).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects a too short password without calling the backend', async () => {
        await expect(
            callRegister({ ...validUser, password: 'short', passwordConfirm: 'short' })
        ).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects missing fields without calling the backend', async () => {
        await expect(callRegister({})).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///mutation callbacks
describe('Registration mutation callbacks', () => {
    it('Logs the server response on success', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const mutation = registerUserMutation() as any

        mutation.onSuccess(apiUser, validUser)

        expect(log).toHaveBeenCalledWith('Server response:', 'Jane', 'Doe')
        expect(log).toHaveBeenCalledWith('Sent email:', validUser.email)
        log.mockRestore()
    })

    it('Logs the error on failure', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { })
        const mutation = registerUserMutation() as any
        const err = new Error('fail')

        mutation.onError(err, validUser)

        expect(error).toHaveBeenCalledWith('Unsuccessful registration:', validUser.email, err)
        error.mockRestore()
    })
})
