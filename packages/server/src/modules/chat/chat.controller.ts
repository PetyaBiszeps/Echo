import { ChatService } from '@/modules/chat/chat.service.ts'
import {
  emitChatRead,
  emitChatUpdated,
  emitMessageNew
} from '@/modules/chat/chat.socket.ts'
import { BadRequestException } from '@/lib/exceptions'
import type {
  Request,
  Response,
  NextFunction
} from 'express'

const DEFAULT_MESSAGES_LIMIT = 30
const MAX_MESSAGES_LIMIT = 50

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
    const page = await service.getMessages(userId, chatId, getMessagePageQuery(req))

    return res.status(200).json({
      success: true,
      data: page
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

    emitMessageNew(message)
    await emitChatUpdated(chatId)

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
    const { chat, readAt } = await service.markChatRead(userId, chatId)

    emitChatRead(chat.id, userId, readAt)
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

function getMessagePageQuery(req: Request) {
  const limit = getMessagesLimit(req.query.limit)
  const before = getMessagesBeforeCursor(req.query.before)

  return {
    limit,
    before
  }
}

function getMessagesLimit(value: unknown) {
  const rawValue = Array.isArray(value)
    ? value[0]
    : value

  if (rawValue === undefined) {
    return DEFAULT_MESSAGES_LIMIT
  }

  const limit = Number(rawValue)

  if (!Number.isInteger(limit) || limit <= 0) {
    throw new BadRequestException('Message limit must be a positive integer')
  }

  return Math.min(limit, MAX_MESSAGES_LIMIT)
}

function getMessagesBeforeCursor(value: unknown) {
  const rawValue = Array.isArray(value)
    ? value[0]
    : value

  if (rawValue === undefined || rawValue === null || rawValue === '') {
    return null
  }

  if (typeof rawValue !== 'string') {
    throw new BadRequestException('Message cursor must be an ISO date string')
  }

  const date = new Date(rawValue)

  if (Number.isNaN(date.getTime())) {
    throw new BadRequestException('Message cursor must be an ISO date string')
  }

  return date
}
