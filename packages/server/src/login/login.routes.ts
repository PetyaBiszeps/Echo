import { registerController, loginController } from '@/login/login.controller'
import { Router } from 'express'

const authRouter: Router = Router()

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)

export default authRouter