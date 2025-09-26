import { RegisterController, LoginController } from '@/login/login.controller'
import { RegisterSchema, LoginSchema } from '@echo/shared'
import { Auth } from '@/middleware/authValidation'
import { Router } from 'express'

const authRouter = Router()

authRouter.post('/register',
    Auth(RegisterSchema),
    RegisterController)

authRouter.post('/login',
    Auth(LoginSchema),
    LoginController)

export default authRouter