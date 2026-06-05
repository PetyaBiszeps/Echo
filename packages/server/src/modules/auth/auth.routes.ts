import { RegisterController, LoginController } from '@/modules/auth/auth.controller.ts'
import { Validate } from '@/middleware/validationHandler.ts'
import { Router } from 'express'
import {
  LoginSchema,
  RegisterSchema
} from '@echo/shared'

const router = Router()

router.post('/register',
  Validate(RegisterSchema),
  RegisterController)

router.post('/login',
  Validate(LoginSchema),
  LoginController)

export default router
