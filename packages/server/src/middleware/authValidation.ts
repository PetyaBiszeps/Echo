import { z } from 'zod'
import {
    Request,
    Response,
    NextFunction
} from 'express'

export function Auth(schema: z.ZodTypeAny) {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body)

        if (!result.success) {
            const errors: Record<string, string[]> = {}

            result.error.issues.forEach(issue => {
                if (!errors[issue.path.join('.')]) {
                    errors[issue.path.join('.')] = []
                }
                errors[issue.path.join('.')].push(issue.message)
            })
            return res.status(400).json({ errors })
        }
        req.body = result.data
        next()
    }
}