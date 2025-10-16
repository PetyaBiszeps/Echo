import { HttpException } from '@/lib/exceptions/HttpException'
import { ErrorCodes } from '@echo/shared'
import type {
    IPayloadAPI
} from '@echo/shared'

export class InternalException<T = unknown> extends HttpException<T> {
    constructor(message = 'Internal Server Error', details?: T) {
        const payload: IPayloadAPI<T> = {
            code: ErrorCodes.INTERNAL_SERVER_ERROR,
            message: message,
            details: (details ?? null) as T | null
        }
        super(500, payload)
    }
}