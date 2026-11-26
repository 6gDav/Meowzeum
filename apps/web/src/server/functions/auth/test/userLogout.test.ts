import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logoutUserMutation } from '../userLogout'

const serverFnOptions = vi.hoisted(() => [] as unknown[])
const getRequestHeader = vi.hoisted(() => vi.fn())
const setResponseHeader = vi.hoisted(() => vi.fn())
const deleteCookie = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-start', () => ({
    createServerFn: (options: unknown) => {
        serverFnOptions.push(options)
        const builder = {
            handler: (fn: () => unknown) => async () => fn(),
        }
        return builder
    },
}))

vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader, setResponseHeader, deleteCookie }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const apiResponse = (body: unknown, status = 200, cookies: string[] = []) => {
    const headers = new Headers()
    cookies.forEach((cookie) => headers.append('set-cookie', cookie))
    return new Response(JSON.stringify(body), { status, headers })
}

const callLogout = () => (logoutUserMutation().mutationFn as any)()

beforeEach(() => {
    mockFetch.mockReset()
    getRequestHeader.mockReset()
    setResponseHeader.mockReset()
    deleteCookie.mockReset()
    getRequestHeader.mockReturnValue('token=abc')
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
    vi.spyOn(console, 'error').mockImplementation(() => { })
})

///route
describe('Logout server function route', () => {
    it('Is created as a POST server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'POST' })
    })

    it('Sends a POST to the backend with the cookie and the internal key', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: null }))

        await callLogout()

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/logout')
        expect(options.method).toBe('POST')
        expect(options.headers.cookie).toBe('token=abc')
        expect(options.headers['x-internal-key']).toBe('test-key')
    })
})

///logic
describe('Logout logic', () => {
    it('Returns success', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: null }))

        expect(await callLogout()).toEqual({ success: true })
    })

    it('Forwards the cookie of the backend which clears the session', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: null }, 200, ['token=; Max-Age=0']))

        await callLogout()

        expect(setResponseHeader).toHaveBeenCalledWith('Set-Cookie', ['token=; Max-Age=0'])
        expect(deleteCookie).not.toHaveBeenCalled()
    })

    it('Clears the cookie itself if the backend answers with an error', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false }, 500))

        expect(await callLogout()).toEqual({ success: true })
        expect(deleteCookie).toHaveBeenCalledWith('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        })
    })

    it('Clears the cookie itself if the backend is not reachable', async () => {
        mockFetch.mockRejectedValue(new Error('network down'))

        expect(await callLogout()).toEqual({ success: true })
        expect(deleteCookie).toHaveBeenCalledWith('token', expect.objectContaining({ path: '/' }))
    })

    it('Sends an empty cookie if there is no cookie', async () => {
        getRequestHeader.mockReturnValue(undefined)
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: null }))

        await callLogout()

        expect(mockFetch.mock.calls[0]![1].headers.cookie).toBe('')
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(callLogout()).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///mutation callbacks
describe('Logout mutation callbacks', () => {
    it('Logs the error on failure', () => {
        const mutation = logoutUserMutation() as any
        const err = new Error('fail')

        mutation.onError(err)

        expect(console.error).toHaveBeenCalledWith('Unsuccessful logout:', err)
    })
})
