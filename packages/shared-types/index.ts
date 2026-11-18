import { z } from 'zod'

//Example only
export const GetSchema = z.object({
  id: z.string(),
  message: z.string()
})

export type Get = z.infer<typeof GetSchema>

export const RegisterUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
})

export const LoginUserSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
})

export const AuthUserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
})

export const AuthResponseSchema = z.object({
  success: z.literal(true),
  user: AuthUserSchema,
})

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>
export type LoginUserInput = z.infer<typeof LoginUserSchema>
export type AuthUser = z.infer<typeof AuthUserSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>