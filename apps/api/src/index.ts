import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import authCors from './components/corsMiddleware'
import catImagesRouter from './components/routes/catImages'
import catInfoRouter from './components/routes/catInfo'
import catInfoDetailRouter from './components/routes/catInfoDetail'
import authRouter from './components/routes/auth'

type Variables = {
  catImages: string[]
}

export const app = new Hono<{ Variables: Variables }>()

const publicCors = cors({
  origin: '*',
  allowMethods: ['GET'],
})

app.use('*', (c, next) =>
  c.req.path.startsWith('/auth') ? next() : publicCors(c, next),
)

app.use('/auth/*', authCors)

app.use('*', logger())

app.get('/favicon.ico', (c) => c.body(null, 204))

app.route('/', catImagesRouter)
app.route('/', catInfoRouter)
app.route('/', catInfoDetailRouter)

app.route('/auth', authRouter)

const port = parseInt(process.env.PORT || '3001')

export default {
  port: port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
