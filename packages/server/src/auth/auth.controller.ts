import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/auth/auth.service'
import type {
    ILogin,
    IRegister,
    IAuthResponse
} from '@echo/shared'

const service = new AuthService()

export async function RegisterController(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as IRegister
        const auth = await service.register(data) as IAuthResponse

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}

export async function LoginController(req: Request, res: Response, next: NextFunction) {
    try {
        const data = req.body as ILogin
        const auth = await service.login(data)

        return res.status(200).json(auth)
    } catch (err) {
        return next(err)
    }
}