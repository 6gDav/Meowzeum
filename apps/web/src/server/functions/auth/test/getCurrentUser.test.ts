import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUserFunc, currentUserQueryOptions } from '../getCurrentUser'

const serverFnOptions = vi.hoisted(() => [] as unknown[])
const getRequestHeader = vi.hoisted(() => vi.fn())

vi.mock('@tanstack/react-start', () => ({
    createServerFn: (options: unknown) => {
        serverFnOptions.push(options)
        const builder = {
            handler: (fn: () => unknown) => async () => fn(),
        }
        return builder
    },
}))

vi.mock('@tanstack/react-start/server', () => ({ getRequestHeader }))

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const apiUser = { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@company.com', avatar: null }

const apiResponse = (body: unknown, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })

beforeEach(() => {
    mockFetch.mockReset()
    getRequestHeader.mockReset()
    getRequestHeader.mockReturnValue('token=abc')
    vi.stubEnv('INTERNAL_API_KEY', 'test-key')
    vi.stubEnv('API_URL', 'http://api.test')
})

///route
describe('Current user server function route', () => {
    it('Is created as a GET server function', () => {
        expect(serverFnOptions).toContainEqual({ method: 'GET' })
    })

    it('Asks the backend /auth/me with the cookie and the internal key', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await getCurrentUserFunc()

        const [url, options] = mockFetch.mock.calls[0]!
        expect(url).toBe('http://api.test/auth/me')
        expect(options.method).toBe('GET')
        expect(options.headers.cookie).toBe('token=abc')
        expect(options.headers['x-internal-key']).toBe('test-key')
    })

    it('Uses the local API if the API_URL is not set', async () => {
        vi.stubEnv('API_URL', undefined)
        vi.stubEnv('NODE_ENV', 'development')
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await getCurrentUserFunc()

        expect(mockFetch.mock.calls[0]![0]).toBe('http://localhost:3001/auth/me')
    })

    it('Uses the production API in production if the API_URL is not set', async () => {
        vi.stubEnv('API_URL', undefined)
        vi.stubEnv('NODE_ENV', 'production')
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        await getCurrentUserFunc()

        expect(mockFetch.mock.calls[0]![0]).toBe('https://meowzeum-api.onrender.com/auth/me')
    })
})

///logic
describe('Current user logic', () => {
    it('Returns the user of the backend', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        expect(await getCurrentUserFunc()).toEqual(apiUser)
    })

    it('Returns null without a cookie and does not call the backend', async () => {
        getRequestHeader.mockReturnValue(undefined)

        expect(await getCurrentUserFunc()).toBeNull()
        expect(mockFetch).not.toHaveBeenCalled()
    })

    it('Returns null if the session is not valid', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false, error: 'Not authenticated' }, 401))

        expect(await getCurrentUserFunc()).toBeNull()
    })

    it('Returns null if the backend says success false with a 200', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: false }))

        expect(await getCurrentUserFunc()).toBeNull()
    })

    it('Returns null if the backend answer is not a JSON', async () => {
        mockFetch.mockResolvedValue(apiResponse('Bad Gateway'))

        expect(await getCurrentUserFunc()).toBeNull()
    })

    it('Returns null instead of crashing if the backend is not reachable', async () => {
        mockFetch.mockRejectedValue(new Error('network down'))

        expect(await getCurrentUserFunc()).toBeNull()
    })

    it('Throws if the INTERNAL_API_KEY is not set', async () => {
        vi.stubEnv('INTERNAL_API_KEY', '')

        await expect(getCurrentUserFunc()).rejects.toThrow('INTERNAL_API_KEY is not set')
        expect(mockFetch).not.toHaveBeenCalled()
    })
})

///query options
describe('currentUserQueryOptions', () => {
    it('Uses the currentUser query key', () => {
        expect(currentUserQueryOptions().queryKey).toEqual(['currentUser'])
    })

    it('Keeps the user fresh for 5 minutes', () => {
        expect(currentUserQueryOptions().staleTime).toBe(5 * 60 * 1000)
    })

    it('Loads the user with the server function', async () => {
        mockFetch.mockResolvedValue(apiResponse({ success: true, data: apiUser }))

        expect(await (currentUserQueryOptions().queryFn as any)()).toEqual(apiUser)
    })
})
