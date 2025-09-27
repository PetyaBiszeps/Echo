import { GetChatController } from '@/modules/chat/chat.controller'
import { AuthGuard } from '@/middleware/authGuard'
import { Router } from 'express'

const router = Router()

router.get('/',
    AuthGuard,
    GetChatController)

export default router