import authRoutes from '@/modules/auth/auth.routes'
import chatRoutes from '@/modules/chat/chat.routes'
import { Router } from 'express'

const router = Router()

router.use('/auth', authRoutes)
router.use('/chats', chatRoutes)

export default router