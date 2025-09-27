import type {
    IJWTPayload
} from '@/types/auth'

declare global {
    namespace Express {
        interface Request {
            user?: IJWTPayload
        }
    }
}

export {}