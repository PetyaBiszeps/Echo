import { z } from 'zod'

export const LoginSchema = z.object({
    email: z.email({
        message: 'Invalid email'
    }),
    password: z.string().min(6, {
        message: 'Password must be between 6 and 16 characters'
    }).max(16, {
        message: 'Password must be between 6 and 16 characters'
    })
})

export type LoginInput = z.infer<typeof LoginSchema>