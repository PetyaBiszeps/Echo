import authRoutes from '@/modules/auth/auth.routes.ts'
import chatRoutes from '@/modules/chat/chat.routes.ts'
import userRoutes from '@/modules/user/user.routes.ts'
import { Router } from 'express'

const router = Router()

router.use('/auth', authRoutes)
router.use('/chats', chatRoutes)
router.use('/users', userRoutes)

export default router
