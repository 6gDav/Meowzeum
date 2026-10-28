import { createServerFn } from '@tanstack/react-start'

export const getDataFromAnotherBackend = createServerFn({ method: 'GET' })
  .handler(async () => {

    const response = await fetch('http://127.0.0.1:3001/')

    if (!response.ok) {
      throw new Error('Error Occured while trying to fetch this api (methode name: getDataFromAnotherBackend)')
    }

    const data = await response.json()
    return data
  })