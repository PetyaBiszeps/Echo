import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/login/login.service'
import type {
    Register,
    Login, AuthResponse
} from '@echo/shared'

const service: AuthService = new AuthService()

export async function registerController(req: Request, res: Response, next: NextFunction) {
    try {
        const data: Register = req.body as Register
        const auth: AuthResponse = await service.register(data)

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}

export async function loginController(req: Request, res: Response, next: NextFunction) {
    try {
        const data: Login = req.body as Login
        const auth: AuthResponse = await service.login(data)

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}