import { RegisterController, LoginController } from '@/modules/auth/auth.controller'
import { RegisterSchema, LoginSchema } from '@echo/shared'
import { Validate } from '@/middleware/validationHandler'
import { Router } from 'express'

const router = Router()

router.post('/register',
    Validate(RegisterSchema),
    RegisterController)

router.post('/login',
    Validate(LoginSchema),
    LoginController)

export default router