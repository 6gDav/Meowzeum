import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { backendDataQueryOptions } from '../functions/externalAPICall'

export const Route = createFileRoute('/')({
  component: App,
})

function App() {
  const { data, isLoading, error } = useQuery(backendDataQueryOptions())

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}