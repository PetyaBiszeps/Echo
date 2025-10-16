import { HttpException } from '@/lib/exceptions/HttpException'
import { ErrorCodes } from '@echo/shared'
import type {
    IPayloadAPI
} from '@echo/shared'

export class UnprocessableEntityException<T = unknown> extends HttpException<T> {
    constructor(message: string, details?: T) {
        const payload: IPayloadAPI<T> = {
            code: ErrorCodes.UNPROCESSABLE_ENTITY,
            message: message,
            details: (details ?? null) as T | null
        }
        super(422, payload)
    }
}