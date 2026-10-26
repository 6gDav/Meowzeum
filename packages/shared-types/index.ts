import { z } from 'zod'

//Example only
export const PostSchema = z.object({
  id: z.string(),
  content: z.string().min(1).max(280),
  authorId: z.string(),
  createdAt: z.date(),
})

export type Post = z.infer<typeof PostSchema>