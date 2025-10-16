import type { Request, Response, NextFunction, Handler } from 'express'
import { ErrorCodes } from '@echo/shared'
import { ZodError } from 'zod'
import {
    HttpException,
    InternalException,
    BadRequestException,
    UnprocessableEntityException
} from '@/lib/exceptions'

const errorHandler = (method: Handler) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await method(req, res, next)
        } catch (err) {
            let exception: HttpException

            if (err instanceof HttpException) {
                exception = err
            } else if (err instanceof ZodError) {
                exception = new UnprocessableEntityException(ErrorCodes.UNPROCESSABLE_ENTITY, err)
            } else if (err instanceof SyntaxError) {
                exception = new BadRequestException(ErrorCodes.BAD_REQUEST, err)
            } else {
                exception = new InternalException(ErrorCodes.INTERNAL_SERVER_ERROR, err)
            }

            return res.status(500).json({
                ok: exception.status,
                data: exception.payload
            })
        }
    }
}

export default errorHandler