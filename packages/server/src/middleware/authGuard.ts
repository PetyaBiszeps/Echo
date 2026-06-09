import type { IJWTPayload } from '@/types'
import env from '@/config/env.ts'
import {
  InternalException,
  UnauthorizedException
} from '@/lib/exceptions'
import jwt from 'jsonwebtoken'
import type {
  Request,
  Response,
  NextFunction
} from 'express'

export function AuthGuard(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new UnauthorizedException('Authorization token required'))
    }

    const token = authHeader.replace('Bearer ', '')

    if (!env.JWT_ACCESS_SECRET) {
      return next(new InternalException('Server configuration error'))
    }
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET) as IJWTPayload

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new UnauthorizedException('Token expired'))
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return next(new UnauthorizedException('Invalid token'))
    }

    return next(new InternalException('Authentication error', error))
  }
}
