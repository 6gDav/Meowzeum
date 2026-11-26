import './mockEnv'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { app } from '../../index'

const mockImgur = vi.hoisted(() => vi.fn())
const mockCatApi = vi.hoisted(() => vi.fn())

vi.mock('@libsql/client', () => ({
  createClient: () => ({ execute: vi.fn() })
}))
vi.mock('../images/catImageFinder', () => ({ default: mockImgur }))
vi.mock('../images/catImageFinder2', () => ({ default: mockCatApi }))

//every request gets a new IP to avoid the rate limiter
let ipCounter = 0
const get = (path: string, headers: Record<string, string> = {}) => {
  ipCounter++
  return app.request(path, { headers: { 'x-forwarded-for': `10.2.0.${ipCounter}`, ...headers } })
}

beforeEach(() => {
  mockImgur.mockReset()
  mockCatApi.mockReset()
})

///GET /get-a-cat-image fallback
describe('GET /get-a-cat-image backend selection', () => {
  it('Uses the first backend if it has images', async () => {
    mockImgur.mockResolvedValue(['https://i.imgur.com/a.jpg'])

    const res = await get('/get-a-cat-image')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(['https://i.imgur.com/a.jpg'])
    expect(mockCatApi).not.toHaveBeenCalled()
  })

  it('Falls back to the second backend if the first one is empty', async () => {
    mockImgur.mockResolvedValue([])
    mockCatApi.mockResolvedValue(['https://cdn2.thecatapi.com/images/a.jpg'])

    const res = await get('/get-a-cat-image')

    expect(res.status).toBe(200)
    expect(await res.json()).toEqual(['https://cdn2.thecatapi.com/images/a.jpg'])
  })

  it('Returns 500 if both backends are empty', async () => {
    mockImgur.mockResolvedValue([])
    mockCatApi.mockResolvedValue([])

    const res = await get('/get-a-cat-image')

    expect(res.status).toBe(500)
    const body = (await res.json()) as { success: boolean }
    expect(body.success).toBe(false)
  })
})

///GET / (info page)
describe('GET /', () => {
  it('Returns the HTML page with the links of the routes', async () => {
    const res = await get('/')
    const html = await res.text()

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/html')
    expect(html).toContain('Hello in Meowzeum API')
    expect(html).toContain('/get-a-cat-image')
    expect(html).toContain('/get-a-cat-info/Ragdoll')
  })

  it('Returns 429 after the 3rd request from the same IP', async () => {
    const sameIp = { 'x-forwarded-for': '88.88.88.88' }

    for (let i = 0; i < 3; i++) {
      expect((await get('/', sameIp)).status).toBe(200)
    }

    expect((await get('/', sameIp)).status).toBe(429)
  })
})

///favicon
describe('GET /favicon.ico', () => {
  it('Returns 204 without a body', async () => {
    const res = await get('/favicon.ico')

    expect(res.status).toBe(204)
    expect(await res.text()).toBe('')
  })
})
