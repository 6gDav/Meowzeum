import { createFileRoute } from '@tanstack/react-router'
import { getDataFromAnotherBackend } from '../functions/externalAPICall'

export const Route = createFileRoute('/')({
  loader: () => getDataFromAnotherBackend(),
  component: App,
})

function App() {
  const data = Route.useLoaderData()

  return (
    <>
      <h1>{data}</h1>
    </>
  )
}