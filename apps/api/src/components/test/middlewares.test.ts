import './mockEnv'
import { describe, it, expect } from 'vitest'
import { Hono } from 'hono'
import limiter from '../middlewares/rateLimiter'
import { authCors, publicCors } from '../middlewares/corsMiddleware'
import internalOnly from '../middlewares/internalOnly'

///rateLimiter
describe('rateLimiter', () => {
  const makeApp = (limit: number) => {
    const testApp = new Hono()
    testApp.get('/', limiter(limit), (c) => c.text('ok'))
    return testApp
  }

  it('Allows requests under the limit and blocks the next one', async () => {
    const testApp = makeApp(2)
    const headers = { 'x-forwarded-for': '1.1.1.1' }

    expect((await testApp.request('/', { headers })).status).toBe(200)
    expect((await testApp.request('/', { headers })).status).toBe(200)

    const blocked = await testApp.request('/', { headers })
    expect(blocked.status).toBe(429)
    expect(await blocked.text()).toBe('Too much request, please try again later')
  })

  it('Counts every IP separately', async () => {
    const testApp = makeApp(1)

    expect((await testApp.request('/', { headers: { 'x-forwarded-for': '2.2.2.2' } })).status).toBe(200)
    expect((await testApp.request('/', { headers: { 'x-forwarded-for': '3.3.3.3' } })).status).toBe(200)
    expect((await testApp.request('/', { headers: { 'x-forwarded-for': '2.2.2.2' } })).status).toBe(429)
  })

  it('Uses only the first IP of x-forwarded-for', async () => {
    const testApp = makeApp(1)

    expect((await testApp.request('/', { headers: { 'x-forwarded-for': '4.4.4.4, 10.0.0.1' } })).status).toBe(200)
    expect((await testApp.request('/', { headers: { 'x-forwarded-for': '4.4.4.4, 10.0.0.2' } })).status).toBe(429)
  })

  it('Uses cf-connecting-ip if there is no x-forwarded-for', async () => {
    const testApp = makeApp(1)

    expect((await testApp.request('/', { headers: { 'cf-connecting-ip': '5.5.5.5' } })).status).toBe(200)
    expect((await testApp.request('/', { headers: { 'cf-connecting-ip': '5.5.5.5' } })).status).toBe(429)
  })

  it('Puts the requests without any IP header into one anonymous group', async () => {
    const testApp = makeApp(1)

    expect((await testApp.request('/')).status).toBe(200)
    expect((await testApp.request('/')).status).toBe(429)
  })

  it('Does not share the counter between two limiters', async () => {
    const testApp = new Hono()
    testApp.get('/a', limiter(1), (c) => c.text('a'))
    testApp.get('/b', limiter(1), (c) => c.text('b'))
    const headers = { 'x-forwarded-for': '6.6.6.6' }

    expect((await testApp.request('/a', { headers })).status).toBe(200)
    expect((await testApp.request('/b', { headers })).status).toBe(200)
  })
})

///internalOnly
describe('internalOnly', () => {
  const testApp = new Hono()
  testApp.use('*', internalOnly)
  testApp.get('/', (c) => c.text('ok'))

  it('Lets the request in with the right key', async () => {
    const res = await testApp.request('/', { headers: { 'x-internal-key': 'test-key' } })

    expect(res.status).toBe(200)
  })

  it('Returns 403 with a wrong key', async () => {
    const res = await testApp.request('/', { headers: { 'x-internal-key': 'wrong' } })

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ success: false, error: 'Forbidden' })
  })

  it('Returns 403 without a key', async () => {
    const res = await testApp.request('/')

    expect(res.status).toBe(403)
  })

  it('Does not accept the key in a different case of the value', async () => {
    const res = await testApp.request('/', { headers: { 'x-internal-key': 'TEST-KEY' } })

    expect(res.status).toBe(403)
  })
})

///publicCors
describe('publicCors', () => {
  const testApp = new Hono()
  testApp.use('*', publicCors)
  testApp.get('/', (c) => c.text('ok'))

  it('Allows every origin', async () => {
    const res = await testApp.request('/', { headers: { Origin: 'http://anything.com' } })

    expect(res.headers.get('access-control-allow-origin')).toBe('*')
  })

  it('Allows only the GET method in the preflight', async () => {
    const res = await testApp.request('/', {
      method: 'OPTIONS',
      headers: { Origin: 'http://anything.com', 'Access-Control-Request-Method': 'POST' }
    })

    expect(res.headers.get('access-control-allow-methods')).toBe('GET')
  })
})

///authCors
describe('authCors', () => {
  const testApp = new Hono()
  testApp.use('*', authCors)
  testApp.get('/', (c) => c.text('ok'))

  const originHeader = (origin: string) => testApp.request('/', { headers: { Origin: origin } })

  it('Allows the production origin with credentials', async () => {
    const res = await originHeader('https://meowzeum-henna.vercel.app')

    expect(res.headers.get('access-control-allow-origin')).toBe('https://meowzeum-henna.vercel.app')
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })

  it.each(['http://localhost:3000', 'http://127.0.0.1:5173', 'http://localhost'])(
    'Allows the local origin %s',
    async (origin) => {
      const res = await originHeader(origin)

      expect(res.headers.get('access-control-allow-origin')).toBe(origin)
    }
  )

  it.each([
    'http://evil.com',
    'https://meowzeum-henna.vercel.app.evil.com',
    'http://meowzeum-henna.vercel.app',
    'https://localhost:3000',
    'http://localhost:3000.evil.com',
    'http://localhost:123456'
  ])('Does not allow the origin %s', async (origin) => {
    const res = await originHeader(origin)

    expect(res.headers.get('access-control-allow-origin')).toBeFalsy()
  })

  it('Lists every needed method once in the preflight', async () => {
    const res = await testApp.request('/', {
      method: 'OPTIONS',
      headers: { Origin: 'http://localhost:3000', 'Access-Control-Request-Method': 'PATCH' }
    })
    const methods = res.headers.get('access-control-allow-methods')!.split(',').map((m) => m.trim())

    expect(new Set(methods).size).toBe(methods.length)
    expect(methods).toEqual(expect.arrayContaining(['POST', 'GET', 'PATCH', 'DELETE']))
  })
})
