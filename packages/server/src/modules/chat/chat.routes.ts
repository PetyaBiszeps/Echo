import {
  GetChatController,
  GetChatMessagesController,
  PostChatController,
  PostChatReadController,
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

router.post('/:chatId/read',
  AuthGuard,
  PostChatReadController)

export default router
