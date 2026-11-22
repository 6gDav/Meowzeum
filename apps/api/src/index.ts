import { Context, Hono, type Next } from 'hono'
import { logger } from 'hono/logger'
import catImagesRouter from './components/routes/catImages'
import catInfoRouter from './components/routes/catInfo'
import catInfoDetailRouter from './components/routes/catInfoDetail'
import { createCommunityRouter } from './components/routes/community'
import { createAuthRouter } from './components/routes/auth'
import authRouter from './components/routes/auth'
import internalOnly from './components/middlewares/internalOnly'
import { publicCors } from './components/middlewares/corsMiddleware'

type Variables = {
  catImages: string[]
}

export const app = new Hono<{ Variables: Variables }>()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))
app.use('*', logger())

app.use('*', (c, next) =>
  c.req.path.startsWith('/auth') ? next() : publicCors(c, next),
)

app.use('/auth/*', internalOnly)
app.get('/favicon.ico', (c) => c.body(null, 204))

//routes
app.route('/', catImagesRouter)
app.route('/', catInfoRouter)
app.route('/', catInfoDetailRouter)

app.route('/auth', createAuthRouter())
app.route('/', createCommunityRouter())

//setup port
const port = parseInt(process.env.PORT || '3001')

export default {
  port: port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}


