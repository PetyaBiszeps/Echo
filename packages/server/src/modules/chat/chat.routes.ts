import {
  GetChatController,
  GetChatMessagesController,
  PostChatController,
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

router.post('/',
  AuthGuard,
  PostChatController)

router.get('/:chatId/messages',
  AuthGuard,
  GetChatMessagesController)

router.post('/:chatId/messages',
  AuthGuard,
  PostChatMessageController)

export default router
