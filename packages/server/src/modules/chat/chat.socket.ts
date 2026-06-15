import { ChatService } from '@/modules/chat/chat.service.ts'
import env from '@/config/env.ts'
import type {
  IJWTPayload
} from '@/types'
import jwt from 'jsonwebtoken'
import type {
  JwtPayload
} from 'jsonwebtoken'
import type {
  IChat,
  IMessage
} from '@echo/shared'
import type {
  Socket,
  Server
} from 'socket.io'

interface ChatJoinPayload {
  chatId: string
}

interface MessageSendPayload {
  chatId: string
  content: string
}

interface TypingPayload {
  chatId: string
}

interface MessageNewPayload {
  message: IMessage
}

interface ChatUpdatedPayload {
  chat: IChat
}

interface ChatReadPayload {
  chatId: string
  userId: string
  readAt: string
}

interface TypingUpdatePayload {
  chatId: string
  userId: string
  isTyping: boolean
}

interface PresenceUpdatePayload {
  userId: string
  isOnline: boolean
}

interface SocketErrorPayload {
  code: string
  message: string
}

interface SocketAckResponse<T = null> {
  ok: boolean
  data?: T
  error?: SocketErrorPayload
}

type SocketAck<T = null> = (response: SocketAckResponse<T>) => void

interface TypingState {
  chatId: string
  userId: string
  socketIds: Set<string>
}

const service = new ChatService()
let socketServer: Server | null = null
const typingByChatUser = new Map<string, TypingState>()
const typingKeysBySocket = new Map<string, Set<string>>()
const socketIdsByUser = new Map<string, Set<string>>()

function initChatSocket(io: Server) {
  socketServer = io

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token

      if (typeof token !== 'string' || !token.trim()) {
        return next(new Error('Authorization token required'))
      }

      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET)

      if (!isJwtPayload(payload)) {
        return next(new Error('Invalid token'))
      }

      socket.data.userId = payload.id

      return next()
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return next(new Error('Token expired'))
      }

      if (error instanceof jwt.JsonWebTokenError) {
        return next(new Error('Invalid token'))
      }

      return next(new Error('Authentication error'))
    }
  })

  io.on('connection', async (socket: Socket) => {
    const userId = getSocketUserId(socket)

    if (!userId) {
      socket.disconnect(true)
      return
    }

    socket.join(getUserRoom(userId))

    const becameOnline = addPresenceSocket(userId, socket.id)

    try {
      const chatIds = await service.getChatIds(userId)
      const peerUserIds = await service.getPeerUserIds(userId)

      await Promise.all(chatIds.map(chatId => socket.join(getChatRoom(chatId))))
      emitInitialPresence(socket, peerUserIds)

      if (becameOnline) {
        emitPresenceToUsers(io, peerUserIds, userId, true)
      }
    } catch {
      emitSocketError(socket, 'CHAT_ROOM_INIT_FAILED', 'Unable to join chat rooms')
    }

    socket.on('chat:join', async (payload: unknown, ack?: SocketAck) => {
      try {
        const data = getChatJoinPayload(payload)

        if (!data) {
          return sendFailure(ack, 'INVALID_CHAT_ID', 'Chat id is required')
        }

        await service.assertMember(userId, data.chatId)
        await socket.join(getChatRoom(data.chatId))
        emitInitialPresence(socket, await service.getChatPeerUserIds(data.chatId, userId))

        return sendSuccess(ack)
      } catch (error) {
        return sendSocketHandlerError(socket, ack, error)
      }
    })

    socket.on('message:send', async (payload: unknown, ack?: SocketAck) => {
      try {
        const payloadData = getMessageSendPayload(payload)

        if (!payloadData.chatId) {
          return sendFailure(ack, 'INVALID_CHAT_ID', 'Chat id is required')
        }

        if (!payloadData.content) {
          return sendFailure(ack, 'INVALID_MESSAGE_CONTENT', 'Message content is required')
        }

        const message = await service.createMessage(userId, payloadData.chatId, payloadData.content)

        emitMessageNew(message)
        await emitChatUpdated(payloadData.chatId)

        return sendSuccess(ack)
      } catch (error) {
        return sendSocketHandlerError(socket, ack, error)
      }
    })

    socket.on('typing:start', async (payload: unknown, ack?: SocketAck) => {
      return handleTypingEvent(io, socket, userId, payload, true, ack)
    })

    socket.on('typing:stop', async (payload: unknown, ack?: SocketAck) => {
      return handleTypingEvent(io, socket, userId, payload, false, ack)
    })

    socket.on('disconnecting', () => {
      clearSocketTyping(io, socket)
    })

    socket.on('disconnect', () => {
      void handlePresenceDisconnect(io, socket, userId)
    })
  })
}

export function emitMessageNew(message: IMessage) {
  if (!socketServer || !message.chatId) {
    return
  }

  const data: MessageNewPayload = {
    message
  }

  socketServer.to(getChatRoom(message.chatId)).emit('message:new', data)
}

export async function emitChatUpdated(chatId: string) {
  if (!socketServer) {
    return
  }

  const updates = await service.getChatUpdates(chatId)

  updates.forEach(({ userId, chat }) => {
    const data: ChatUpdatedPayload = {
      chat
    }

    socketServer?.to(getUserRoom(userId)).emit('chat:updated', data)
  })
}

export function emitChatRead(chatId: string, userId: string, readAt: string) {
  if (!socketServer) {
    return
  }

  const data: ChatReadPayload = {
    chatId,
    userId,
    readAt
  }

  socketServer.to(getChatRoom(chatId)).emit('chat:read', data)
}

async function handleTypingEvent(
  io: Server,
  socket: Socket,
  userId: string,
  payload: unknown,
  isTyping: boolean,
  ack?: SocketAck
) {
  try {
    const data = getTypingPayload(payload)

    if (!data) {
      return sendFailure(ack, 'INVALID_CHAT_ID', 'Chat id is required')
    }

    await service.assertMember(userId, data.chatId)

    const shouldBroadcast = isTyping
      ? addSocketTyping(socket, data.chatId, userId)
      : removeSocketTyping(socket, data.chatId, userId)

    if (shouldBroadcast) {
      emitTypingUpdate(io, socket.id, data.chatId, userId, isTyping)
    }

    return sendSuccess(ack)
  } catch (error) {
    return sendSocketHandlerError(socket, ack, error)
  }
}

function addSocketTyping(socket: Socket, chatId: string, userId: string) {
  const key = getTypingKey(chatId, userId)
  const state = typingByChatUser.get(key)

  if (state) {
    if (state.socketIds.has(socket.id)) {
      return false
    }

    state.socketIds.add(socket.id)
    addTypingKeyToSocket(socket.id, key)

    return false
  }

  typingByChatUser.set(key, {
    chatId,
    userId,
    socketIds: new Set([socket.id])
  })
  addTypingKeyToSocket(socket.id, key)

  return true
}

function removeSocketTyping(socket: Socket, chatId: string, userId: string) {
  const key = getTypingKey(chatId, userId)
  const state = typingByChatUser.get(key)

  if (!state?.socketIds.has(socket.id)) {
    return false
  }

  state.socketIds.delete(socket.id)
  removeTypingKeyFromSocket(socket.id, key)

  if (state.socketIds.size > 0) {
    return false
  }

  typingByChatUser.delete(key)

  return true
}

function clearSocketTyping(io: Server, socket: Socket) {
  const keys = typingKeysBySocket.get(socket.id)

  if (!keys) {
    return
  }

  typingKeysBySocket.delete(socket.id)

  keys.forEach(key => {
    const state = typingByChatUser.get(key)

    if (!state) {
      return
    }

    state.socketIds.delete(socket.id)

    if (state.socketIds.size > 0) {
      return
    }

    typingByChatUser.delete(key)
    emitTypingUpdate(io, socket.id, state.chatId, state.userId, false)
  })
}

function addTypingKeyToSocket(socketId: string, key: string) {
  const keys = typingKeysBySocket.get(socketId) ?? new Set<string>()

  keys.add(key)
  typingKeysBySocket.set(socketId, keys)
}

function removeTypingKeyFromSocket(socketId: string, key: string) {
  const keys = typingKeysBySocket.get(socketId)

  if (!keys) {
    return
  }

  keys.delete(key)

  if (keys.size === 0) {
    typingKeysBySocket.delete(socketId)
  }
}

function emitTypingUpdate(io: Server, socketId: string, chatId: string, userId: string, isTyping: boolean) {
  const data: TypingUpdatePayload = {
    chatId,
    userId,
    isTyping
  }

  io.to(getChatRoom(chatId)).except(socketId).emit('typing:update', data)
}

async function handlePresenceDisconnect(io: Server, socket: Socket, userId: string) {
  const becameOffline = removePresenceSocket(userId, socket.id)

  if (!becameOffline) {
    return
  }

  try {
    emitPresenceToUsers(io, await service.getPeerUserIds(userId), userId, false)
  } catch {
    // Presence is best-effort process-local state; avoid surfacing disconnect cleanup failures.
  }
}

function addPresenceSocket(userId: string, socketId: string) {
  const socketIds = socketIdsByUser.get(userId) ?? new Set<string>()
  const wasOffline = socketIds.size === 0

  socketIds.add(socketId)
  socketIdsByUser.set(userId, socketIds)

  return wasOffline
}

function removePresenceSocket(userId: string, socketId: string) {
  const socketIds = socketIdsByUser.get(userId)

  if (!socketIds?.has(socketId)) {
    return false
  }

  socketIds.delete(socketId)

  if (socketIds.size > 0) {
    return false
  }

  socketIdsByUser.delete(userId)

  return true
}

function emitInitialPresence(socket: Socket, userIds: string[]) {
  getUniqueUserIds(userIds).forEach(userId => {
    if (isUserOnline(userId)) {
      emitPresence(socket, userId, true)
    }
  })
}

function emitPresenceToUsers(io: Server, recipientUserIds: string[], userId: string, isOnline: boolean) {
  const data = getPresenceUpdatePayload(userId, isOnline)

  getUniqueUserIds(recipientUserIds).forEach(recipientUserId => {
    io.to(getUserRoom(recipientUserId)).emit('presence:update', data)
  })
}

function emitPresence(socket: Socket, userId: string, isOnline: boolean) {
  socket.emit('presence:update', getPresenceUpdatePayload(userId, isOnline))
}

function getPresenceUpdatePayload(userId: string, isOnline: boolean): PresenceUpdatePayload {
  return {
    userId,
    isOnline
  }
}

function isUserOnline(userId: string) {
  return Boolean(socketIdsByUser.get(userId)?.size)
}

function getUniqueUserIds(userIds: string[]) {
  return Array.from(new Set(userIds))
}

function isJwtPayload(payload: string | JwtPayload): payload is IJWTPayload {
  return typeof payload === 'object'
    && payload !== null
    && typeof payload.id === 'string'
    && Boolean(payload.id)
}

function getSocketUserId(socket: Socket) {
  const userId = socket.data.userId

  return typeof userId === 'string' && userId
    ? userId
    : null
}

function getPayloadString(payload: unknown, key: string) {
  if (!payload || typeof payload !== 'object') {
    return ''
  }

  const value = (payload as Record<string, unknown>)[key]

  return typeof value === 'string'
    ? value.trim()
    : ''
}

function getChatJoinPayload(payload: unknown): ChatJoinPayload | null {
  const chatId = getPayloadString(payload, 'chatId')

  return chatId
    ? { chatId }
    : null
}

function getMessageSendPayload(payload: unknown): MessageSendPayload {
  return {
    chatId: getPayloadString(payload, 'chatId'),
    content: getPayloadString(payload, 'content')
  }
}

function getTypingPayload(payload: unknown): TypingPayload | null {
  const chatId = getPayloadString(payload, 'chatId')

  return chatId
    ? { chatId }
    : null
}

function getTypingKey(chatId: string, userId: string) {
  return `${chatId}:${userId}`
}

function getUserRoom(userId: string) {
  return `user:${userId}`
}

function getChatRoom(chatId: string) {
  return `chat:${chatId}`
}

function sendSuccess<T = null>(ack?: SocketAck<T>, data?: T) {
  ack?.({
    ok: true,
    data
  })
}

function sendFailure(ack: SocketAck | undefined, code: string, message: string) {
  const error: SocketErrorPayload = {
    code,
    message
  }

  ack?.({
    ok: false,
    error
  })
}

function sendSocketHandlerError(socket: Socket, ack: SocketAck | undefined, error: unknown) {
  const message = error instanceof Error
    ? error.message
    : 'Socket handler failed'

  emitSocketError(socket, 'SOCKET_HANDLER_FAILED', message)
  sendFailure(ack, 'SOCKET_HANDLER_FAILED', message)
}

function emitSocketError(socket: Socket, code: string, message: string) {
  socket.emit('socket:error', {
    code,
    message
  })
}

export default initChatSocket
