import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { backendDataQueryOptions } from '../functions/externalAPICall'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data, isLoading, error } = useQuery(backendDataQueryOptions())

  if (isLoading) return <p>Loading...</p>
  if (error) return <span color="red"><h1>Error!</h1><h3>{error.message}</h3></span>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}
