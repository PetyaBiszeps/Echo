import { z } from 'zod'
import type {
    IRegister,
    ILogin
} from './types'

export const RegisterSchema = z.object({
    username: z.string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/),
    password: z.string()
        .min(8)
        .max(100)
}) satisfies z.ZodType<IRegister>

export const LoginSchema = z.object({
    username: z.string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_]+$/),
    password: z.string()
        .min(8)
        .max(100)
}) satisfies z.ZodType<ILogin>