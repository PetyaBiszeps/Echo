import { z } from 'zod'

export const UserSchema = z.object({
    username: z.string().min(3)
})

export type User = z.infer<typeof UserSchema>