import { Hono } from 'hono'
import { type Get } from '@Meowzeum/shared-types'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    id: '123',
    message: 'Hello from the backend'
  } satisfies Get)
})

export default {
  port: 3001,
  fetch: app.fetch,
}