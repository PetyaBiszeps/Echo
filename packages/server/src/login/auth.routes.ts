import { RegisterController, LoginController } from '@/login/auth.controller'
import { RegisterSchema, LoginSchema } from '@echo/shared'
import { Auth } from '@/middleware/authValidation'
import { Router } from 'express'

const router = Router()

router.post('/register',
    Auth(RegisterSchema),
    RegisterController)

router.post('/login',
    Auth(LoginSchema),
    LoginController)

export default router