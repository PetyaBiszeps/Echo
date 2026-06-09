import { HttpException } from '@/lib/exceptions/HttpException.ts'
import { ErrorCodes } from '@echo/shared'
import type {
  IPayloadAPI
} from '@echo/shared'

export class UnauthorizedException<T = unknown> extends HttpException<T> {
  constructor(message: string, details?: T) {
    const payload: IPayloadAPI<T> = {
      code: ErrorCodes.UNAUTHORIZED,
      message: message,
      details: (details ?? null) as T | null
    }
    super(401, payload)
  }
}
