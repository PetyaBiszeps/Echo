import jwt from 'jsonwebtoken'
import type { NextFunction, Request, Response } from 'express'

interface jwtPayload {
    id: string
    username: string
    iat?: number
    exp?: number
}

declare module 'express-serve-static-core' {
    interface Request {
        user?: jwtPayload
    }
}

export function AuthGuard(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization token required'
            })
        }

        const token = authHeader.replace('Bearer ', '')

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                error: 'Server configuration error'
            })
        }
        req.user = jwt.verify(token, process.env.JWT_SECRET) as jwtPayload

        next()
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            })
        }

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
                success: false,
                error: 'Token expired'
            })
        }

        return res.status(500).json({
            success: false,
            error: 'Authentication error'
        })
    }
}