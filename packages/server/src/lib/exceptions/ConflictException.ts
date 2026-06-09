import { HttpException } from '@/lib/exceptions/HttpException.ts'
import { ErrorCodes } from '@echo/shared'
import type {
  IPayloadAPI
} from '@echo/shared'

export class ConflictException<T = unknown> extends HttpException<T> {
  constructor(message: string, details?: T) {
    const payload: IPayloadAPI<T> = {
      code: ErrorCodes.CONFLICT,
      message: message,
      details: (details ?? null) as T | null
    }
    super(409, payload)
  }
}
