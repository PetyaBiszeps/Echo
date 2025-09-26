import authRoutes from '@/login/auth.routes'
import { Router } from 'express'

const router = Router()

router.use('/auth', authRoutes)

export default router