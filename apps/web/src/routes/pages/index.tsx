import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { backendDataQueryOptions } from '../../server/functions/externalAPICall'

import Expetion from '#/components/exeptionMaker'

export const Route = createFileRoute('/pages/')({
  component: App,
})

function App() {
  const { data, isLoading, error } = useQuery(backendDataQueryOptions())
  Expetion();

  if (isLoading) return <p>Loading...</p>
  if (error) return <p>Error: {error.message}</p>

  return <pre>{JSON.stringify(data, null, 2)}</pre>
}