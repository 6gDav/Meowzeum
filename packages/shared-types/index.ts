import { z } from 'zod'

//Example only
export const GetSchema = z.object({
  id: z.string(),
  message: z.string()
})

export type Get = z.infer<typeof GetSchema>