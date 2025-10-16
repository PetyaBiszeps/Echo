import type { IPayloadAPI } from '@echo/shared'
import type {
    IJWTPayload
} from '@/types/auth'

declare global {
    namespace Express {
        interface Request {
            user?: IJWTPayload
        }

        interface Response {
            fail: (data: IPayloadAPI, statusCode?: number) => Response
            success: (data: IPayloadAPI, statusCode?: number) => Response
        }
    }
}

export {}