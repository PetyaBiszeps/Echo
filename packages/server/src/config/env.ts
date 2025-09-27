import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

dotenv.config({
    path: path.resolve(process.cwd(), 'packages/server/.env')
})

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().positive().default(3001),
    CORS_ORIGIN: z.string().min(1).default('http://localhost:5173'),
    DATABASE_URL: z.string().min(1),
    JWT_ACCESS_SECRET: z.string().min(1),
    JWT_REFRESH_SECRET: z.string().optional().default(''),
    COOKIE_SECRET: z.string().optional().default(''),
    REDIS_URL: z.string().optional().default(''),
    UPLOAD_DIR: z.string().optional().default('uploads'),
})
const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
    console.error('Invalid environment variable:')

    for (const issue of parsed.error.issues) {
        console.error(`- ${issue.path.join('.')}: ${issue.message}`)
    }
    process.exit(1)
}
const env = parsed.data

export default env