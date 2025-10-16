import type {
    IPayloadAPI
} from '@echo/shared'

export class HttpException<T = unknown> extends Error {
    readonly status: number
    readonly payload: IPayloadAPI<T>

    constructor(status: number, payload: IPayloadAPI<T>) {
        super(payload.message)

        this.name = new.target.name
        this.status = status
        this.payload = payload

        Object.setPrototypeOf(this, new.target.prototype)
        Error.captureStackTrace?.(this, this.constructor)
    }
}