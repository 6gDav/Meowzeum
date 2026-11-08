import { rateLimiter } from 'hono-rate-limiter'

function limiter(limitCount: number) {
  return rateLimiter({
    windowMs: 1 * 60 * 1000,
    limit: limitCount,
    standardHeaders: 'draft-6',
    keyGenerator: (c) => {
      const forwarded = c.req.header('x-forwarded-for')
      const cfIp = c.req.header('cf-connecting-ip')
      
      const ip = forwarded || cfIp || 'anonymous'
      
      return ip.split(',')[0]?.trim() || 'anonymous'
    },
    handler: (c) => {
      console.log('Fetch blocked to avoid overload')
      return c.text('Too much request, please try again later', 429)
    }
  })
}

export default limiter