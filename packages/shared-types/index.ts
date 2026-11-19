import { z } from 'zod'

export const RegistrationInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
})

export const LoginInputSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type RegistrationInput = z.infer<typeof RegistrationInputSchema>

export type LoginInput = z.infer<typeof LoginInputSchema>
