import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'

export const getDataFromAnotherBackend = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await fetch('http://127.0.0.1:3001/')

    if (!response.ok) {
      throw new Error(
        'Error occurred while trying to fetch this API (method name: getDataFromAnotherBackend)'
      )
    }

    return await response.json()
  })

export const backendDataQueryOptions = () =>
  queryOptions({
    queryKey: ['backend-data'],
    queryFn: () => getDataFromAnotherBackend(),
  })