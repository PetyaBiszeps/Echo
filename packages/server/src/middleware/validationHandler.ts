import { z } from 'zod'
import type {
    Request,
    Response,
    NextFunction
} from 'express'

export function Validate(schema: z.ZodTypeAny) {
    return async (req: Request, _res: Response, next: NextFunction) => {
        try {
            req.body = await schema.parseAsync(req.body)
            next()
        } catch (err) {
            next(err)
        }
    }
}