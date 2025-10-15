import type { IErrorAPI, ISuccessAPI } from '@echo/shared'
import type {
    IJWTPayload
} from '@/types/auth'

declare global {
    namespace Express {
        interface Request {
            user?: IJWTPayload
        }

        interface Response {
            fail: (data: IErrorAPI['data'], statusCode?: number) => Response
            ok: (data: ISuccessAPI['data'], statusCode?: number) => Response
        }
    }
}

export {}