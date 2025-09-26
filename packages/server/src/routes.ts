import authRoutes from '@/auth/auth.routes'
import chatRoutes from '@/chat/chat.routes'
import { Router } from 'express'

const router = Router()

router.use('/auth', authRoutes)
router.use('/chats', chatRoutes)

export default router