import type { Request, Response, NextFunction } from 'express'
import { ErrorMessages } from '@echo/shared'
import { ZodError } from 'zod'
import {
    HttpException,
    InternalException,
    BadRequestException,
    UnprocessableEntityException
} from '@/lib/exceptions'

function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
    let exception: HttpException
    void next

    if (err instanceof HttpException) {
        exception = err
    } else if (err instanceof ZodError) {
        const ZodErrors = err.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
        }))

        exception = new UnprocessableEntityException(ErrorMessages.UNPROCESSABLE_ENTITY, ZodErrors)
    } else if (err instanceof SyntaxError) {
        exception = new BadRequestException(ErrorMessages.BAD_REQUEST, err)
    } else {
        exception = new InternalException(ErrorMessages.INTERNAL_SERVER_ERROR, err)
    }

    return res.status(exception.status).json({
        ok: false,
        status: exception.status,
        data: exception.payload
    })
}

export default errorHandler