import loginRoutes from '@/login/login.routes'
import { Router } from 'express'

const router: Router = Router()

router.use('/auth', loginRoutes)

export default router