import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateProfileMutation } from '../updateProfile'

const serverFnOptions = vi.hoisted(() => [] as unknown[])
const getRequestHeader = vi.hoisted(() => vi.fn())
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

vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader, setResponseHeader }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const validUpdate = {
    firstName: 'Janet',
    lastName: 'Smith',
    email: 'janet.smith@company.com',
}

const apiResponse = (body: unknown, status = 200, cookies: string[] = []) => {
    const headers = new Headers()
    cookies.forEach((cookie) => headers.append('set-cookie', cookie))
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })
}

const callUpdate = (input: object) => (updateProfileMutation().mutationFn as any)(input)

beforeEach(() => {
    mockFetch.mockReset()
    getRequestHeader.mockReset()
    setResponseHeader.mockReset()
    getRequestHeader.mockReturnValue('token=abc')
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
})

///route
describe('Update profile server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Sends a PATCH to the backend with the cookie and the internal key', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        await callUpdate(validUpdate)

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/profileChange')
        expect(options.method).toBe('PATCH')
        expect(options.headers.cookie).toBe('token=abc')
        expect(options.headers['x-internal-key']).toBe('test-key')
        expect(JSON.parse(options.body)).toEqual(validUpdate)
    })

    it('Sends an empty cookie if there is no cookie', async () => {
        getRequestHeader.mockReturnValue(undefined)
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        await callUpdate(validUpdate)

        expect(mockFetch.mock.calls[0]![1].headers.cookie).toBe('')
    })
})

///logic
describe('Update profile logic', () => {
    it('Returns the updated user', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        expect(await callUpdate(validUpdate)).toEqual(validUpdate)
    })

    it('Sends the new password to the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        await callUpdate({ ...validUpdate, password: 'NewStr0ngP@ss!' })

        expect(JSON.parse(mockFetch.mock.calls[0]![1].body).password).toBe('NewStr0ngP@ss!')
    })

    it('Cleans and lowercases the data before sending', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        await callUpdate({ firstName: '  Janet ', lastName: ' Smith', email: 'Janet.Smith@Company.com' })

        expect(JSON.parse(mockFetch.mock.calls[0]![1].body)).toEqual(validUpdate)
    })

    it('Forwards the new session cookie of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }, 200, ['token=new; HttpOnly']))

        await callUpdate(validUpdate)

        expect(setResponseHeader).toHaveBeenCalledWith('Set-Cookie', ['token=new; HttpOnly'])
    })

    it('Does not set a cookie if the backend did not send one', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: validUpdate }))

        await callUpdate(validUpdate)

        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws the error message of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false, error: 'Email is already in use' }, 409))

        await expect(callUpdate(validUpdate)).rejects.toThrow('Email is already in use')
        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws a default error if the backend answer is not a JSON', async () => {
        mockFetch.mockResolvedValue(apiResponse('Bad Gateway', 502))

        await expect(callUpdate(validUpdate)).rejects.toThrow('Profile update failed')
    })

    it('Throws if the backend says success false with a 200', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false }))

        await expect(callUpdate(validUpdate)).rejects.toThrow('Profile update failed')
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(callUpdate(validUpdate)).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty first name without calling the backend', async () => {
        await expect(callUpdate({ ...validUpdate, firstName: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects an empty last name without calling the backend', async () => {
        await expect(callUpdate({ ...validUpdate, lastName: '' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects a malformed email without calling the backend', async () => {
        await expect(callUpdate({ ...validUpdate, email: 'not-an-email' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Rejects a too short password without calling the backend', async () => {
        await expect(callUpdate({ ...validUpdate, password: 'short' })).rejects.toThrow()
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///mutation callbacks
describe('Update profile mutation callbacks', () => {
    it('Logs the error on failure', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { })
        const mutation = updateProfileMutation() as any
        const err = new Error('fail')

        mutation.onError(err, validUpdate)

        expect(error).toHaveBeenCalledWith('Profile update failed:', validUpdate.email, err)
        error.mockRestore()
    })
})
