import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/login/login.service'
import type {
    Login,
    Register
} from '@echo/shared'

const service = new AuthService()

export async function RegisterController(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as Register
        const auth = await service.register(data)

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}

export async function LoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as Login
        const auth = await service.login(data)

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}