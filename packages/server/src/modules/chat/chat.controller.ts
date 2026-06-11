import { ChatService } from '@/modules/chat/chat.service.ts'
import { emitChatUpdated } from '@/modules/chat/chat.socket.ts'
import type {
  Request,
  Response,
  NextFunction
} from 'express'

const service = new ChatService()

export async function GetChatController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req, res)

    if (!userId) {
      return undefined
    }

    const chats = await service.getChats(userId)

    return res.status(200).json({
      success: true,
      data: chats
    })
  } catch (err) {
    return next(err)
  }
}

export async function PostChatController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req, res)

    if (!userId) {
      return undefined
    }

    const chat = await service.createDirectChat(userId, req.body?.username)

    await emitChatUpdated(chat.id)

    return res.status(201).json({
      success: true,
      data: chat
    })
  } catch (err) {
    return next(err)
  }
}

export async function GetChatMessagesController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req, res)

    if (!userId) {
      return undefined
    }

    const chatId = getChatId(req)
    const messages = await service.getMessages(userId, chatId)

    return res.status(200).json({
      success: true,
      data: messages
    })
  } catch (err) {
    return next(err)
  }
}

export async function PostChatMessageController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req, res)

    if (!userId) {
      return undefined
    }

    const chatId = getChatId(req)
    const message = await service.createMessage(userId, chatId, req.body?.content)

    return res.status(201).json({
      success: true,
      data: message
    })
  } catch (err) {
    return next(err)
  }
}

export async function PostChatReadController(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = requireUserId(req, res)

    if (!userId) {
      return undefined
    }

    const chatId = getChatId(req)
    const chat = await service.markChatRead(userId, chatId)

    await emitChatUpdated(chat.id)

    return res.status(200).json({
      success: true,
      data: chat
    })
  } catch (err) {
    return next(err)
  }
}

function requireUserId(req: Request, res: Response) {
  const userId = req.user?.id

  if (!userId) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized'
    })

    return null
  }

  return userId
}

function getChatId(req: Request) {
  const chatId = req.params.chatId

  return Array.isArray(chatId) ? chatId[0] : chatId
}
