import type {
    Request,
    Response,
    NextFunction,
    ErrorRequestHandler
} from 'express'

const errorHandler: ErrorRequestHandler = (err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
        return next(err as string)
    }

    return res.status(500).json({
        error: 'Internal Server Error'
    })
}

export default errorHandler