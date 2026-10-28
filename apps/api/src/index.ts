import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json("Hello from the backend"))

export default {
    port: 3001,
    fetch: app.fetch,
}