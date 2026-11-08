import { createServerFn } from '@tanstack/react-start'
import { queryOptions } from '@tanstack/react-query'
import { GetSchema } from '@Meowzeum/shared-types'

export const getDataFromAnotherBackend = createServerFn({ method: 'GET' })
  .handler(async () => {
    const response = await fetch('http://127.0.0.1:3001/')

    if (!response.ok) {
      throw new Error(
        'Error occurred while trying to fetch this API (method name: getDataFromAnotherBackend)'
      )
    }

    const rawData = await response.json()

    return GetSchema.parse(rawData)
  })

export const backendDataQueryOptions = () =>
  queryOptions({
    queryKey: ['backend-data'],
    queryFn: () => getDataFromAnotherBackend(),
  })