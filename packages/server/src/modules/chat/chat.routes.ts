import {
  GetChatController,
  GetChatMessagesController,
  PostChatMessageController
} from '@/modules/chat/chat.controller.ts'
import { AuthGuard } from '@/middleware/authGuard.ts'
import {
  Router
} from 'express'

const router = Router()

router.get('/',
  AuthGuard,
  GetChatController)

router.get('/:chatId/messages',
  AuthGuard,
  GetChatMessagesController)

router.post('/:chatId/messages',
  AuthGuard,
  PostChatMessageController)

export default router
