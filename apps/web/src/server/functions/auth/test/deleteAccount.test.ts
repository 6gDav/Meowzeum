import { describe, it, expect, vi, beforeEach } from 'vitest'
import { deleteProfileMutation } from '../deleteAccount'

const serverFnOptions = vi.hoisted(() => [] as unknown[])
const getRequestHeader = vi.hoisted(() => vi.fn())
const setResponseHeader = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-start', () => ({
    createServerFn: (options: unknown) => {
        serverFnOptions.push(options)
        const builder = {
            handler: (fn: () => unknown) => async () => fn(),
        }
        return builder
    },
}))

vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader, setResponseHeader }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const apiResponse = (body: unknown, status = 200, cookies: string[] = []) => {
    const headers = new Headers()
    cookies.forEach((cookie) => headers.append('set-cookie', cookie))
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), { status, headers })
}

const callDelete = () => (deleteProfileMutation().mutationFn as any)()

beforeEach(() => {
    mockFetch.mockReset()
    getRequestHeader.mockReset()
    setResponseHeader.mockReset()
    getRequestHeader.mockReturnValue('token=abc')
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
})

///route
describe('Delete account server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Sends a DELETE to the backend with the cookie and the internal key', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true }))

        await callDelete()

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/profileDelete')
        expect(options.method).toBe('DELETE')
        expect(options.headers.cookie).toBe('token=abc')
        expect(options.headers['x-internal-key']).toBe('test-key')
    })
})

///logic
describe('Delete account logic', () => {
    it('Returns success', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true }))

        expect(await callDelete()).toEqual({ success: true })
    })

    it('Forwards the cookie of the backend which clears the session', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true }, 200, ['token=; Max-Age=0']))

        await callDelete()

        expect(setResponseHeader).toHaveBeenCalledWith('Set-Cookie', ['token=; Max-Age=0'])
    })

    it('Does not set a cookie if the backend did not send one', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true }))

        await callDelete()

        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws the error message of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false, error: 'User not found' }, 404))

        await expect(callDelete()).rejects.toThrow('User not found')
        expect(setResponseHeader).not.toHaveBeenCalled()
    })

    it('Throws a default error if the backend answer is not a JSON', async () => {
        mockFetch.mockResolvedValue(apiResponse('Bad Gateway', 502))

        await expect(callDelete()).rejects.toThrow('Profile deletion failed')
    })

    it('Throws if the backend says success false with a 200', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false }))

        await expect(callDelete()).rejects.toThrow('Profile deletion failed')
    })

    it('Throws if the backend is not reachable', async () => {
        mockFetch.mockRejectedValue(new Error('network down'))

        await expect(callDelete()).rejects.toThrow('network down')
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(callDelete()).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///mutation callbacks
describe('Delete account mutation callbacks', () => {
    it('Logs the error on failure', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => { })
        const mutation = deleteProfileMutation() as any
        const err = new Error('fail')

        mutation.onError(err)

        expect(error).toHaveBeenCalledWith('Profile deletion failed:', err)
        error.mockRestore()
    })
})
