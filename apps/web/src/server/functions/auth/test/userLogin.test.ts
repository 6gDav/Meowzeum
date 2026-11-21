import { describe, it, expect, vi, beforeEach } from 'vitest'
import { loginUserMutation } from '../userLogin'

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

const validLogin = {
    email: 'jane.doe@company.com',
    password: 'Str0ngP@ssw0rd!',
}

const apiUser = { id: 3, firstName: 'Jane', lastName: 'Doe', email: validLogin.email }

const apiResponse = (body: unknown, status = 200, cookies: string[] = []) => {
    const headers = new Headers()
    cookies.forEach((cookie) => headers.append('set-cookie', cookie))
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })
}

const callLogin = (input: object) => (loginUserMutation().mutationFn as any)(input)

beforeEach(() => {
    mockFetch.mockReset()
    setResponseHeader.mockReset()
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
})

///route
describe('Login server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Sends the data to the backend login endpoint', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await callLogin(validLogin)

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/login')
        expect(options.method).toBe('POST')
        expect(options.headers['x-internal-key']).toBe('test-key')
        expect(JSON.parse(options.body)).toEqual(validLogin)
    })
})

///logic
describe('Login logic', () => {
    it('Successfully returns the user data', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        const res = await callLogin(validLogin)

        expect(res).toEqual(apiUser)
    })

    it('Forwards the cookie of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }, 200, ['token=abc; HttpOnly']))

        await callLogin(validLogin)

        expect(setResponseHeader).toHaveBeenCalledWith('Set-Cookie', ['token=abc; HttpOnly'])
    })

    it('Does not set a cookie if the backend did not send one', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await callLogin(validLogin)

        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws the error message of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false, error: 'Invalid email or password' }, 401))

        await expect(callLogin(validLogin)).rejects.toThrow('Invalid email or password')
    })

    it('Throws a default error if the backend answer is not a JSON', async () => {
        mockFetch.mockResolvedValue(apiResponse('Bad Gateway', 502))

        await expect(callLogin(validLogin)).rejects.toThrow('Login failed')
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(callLogin(validLogin)).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty email without calling the backend', async () => {
        await expect(callLogin({ ...validLogin, email: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty password without calling the backend', async () => {
        await expect(callLogin({ ...validLogin, password: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects a malformed email without calling the backend', async () => {
        await expect(callLogin({ ...validLogin, email: 'not-an-email' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects missing fields without calling the backend', async () => {
        await expect(callLogin({})).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///mutation callbacks
describe('Login mutation callbacks', () => {
    it('Logs the server response on success', () => {
        const log = vi.spyOn(console, 'log').mockImplementation(() => { })
        const mutation = loginUserMutation() as any

        mutation.onSuccess(apiUser, validLogin)

        expect(log).toHaveBeenCalledWith('Server response:', 'Jane')
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
