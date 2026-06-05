import { GetChatController } from '@/modules/chat/chat.controller.ts'
import { AuthGuard } from '@/middleware/authGuard.ts'
import {
  Router
} from 'express'

const router = Router()

router.get('/',
  AuthGuard,
  GetChatController)

export default router
