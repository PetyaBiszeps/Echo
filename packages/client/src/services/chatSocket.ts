import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type {
  IChat,
  IMessage
} from '@echo/shared'

type ChatSocketHandlers = {
  onMessageNew: (message: IMessage) => void
  onChatUpdated: (chat: IChat) => void
  onTypingUpdate: (payload: TypingUpdatePayload) => void
}

type TypingUpdatePayload = {
  chatId: string
  userId: string
  isTyping: boolean
}

type ServerToClientEvents = {
  'message:new': (payload: unknown) => void
  'chat:updated': (payload: unknown) => void
  'typing:update': (payload: unknown) => void
}

type ClientToServerEvents = {
  'chat:join': (payload: { chatId: string }) => void
  'typing:start': (payload: { chatId: string }) => void
  'typing:stop': (payload: { chatId: string }) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
let socketToken = ''
const joinedChatIds = new Set<string>()

export function connectChatSocket(token: string, handlers: ChatSocketHandlers) {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    disconnectChatSocket()
    return null
  }

  if (socket && socketToken !== normalizedToken) {
    disconnectChatSocket()
  }

  if (!socket) {
    socket = io(getSocketOrigin(), {
      auth: {
        token: normalizedToken
      },
      autoConnect: false,
      withCredentials: true
    })
    socketToken = normalizedToken
  } else {
    socket.auth = {
      token: normalizedToken
    }
    socketToken = normalizedToken
  }

  socket.off('message:new')
  socket.on('message:new', (payload) => {
    const message = getMessageNewPayload(payload)

    if (message) {
      handlers.onMessageNew(message)
    }
  })

  socket.off('chat:updated')
  socket.on('chat:updated', (payload) => {
    const chat = getChatUpdatedPayload(payload)

    if (chat) {
      handlers.onChatUpdated(chat)
    }
  })

  socket.off('typing:update')
  socket.on('typing:update', (payload) => {
    const typingUpdate = getTypingUpdatePayload(payload)

    if (typingUpdate) {
      handlers.onTypingUpdate(typingUpdate)
    }
  })

  if (!socket.connected) {
    socket.connect()
  }

  return socket
}

export function disconnectChatSocket() {
  if (!socket) {
    socketToken = ''
    return
  }

  socket.off('message:new')
  socket.off('chat:updated')
  socket.off('typing:update')
  socket.disconnect()
  socket = null
  socketToken = ''
  joinedChatIds.clear()
}

export function joinChatRoom(chatId: string) {
  const normalizedChatId = chatId.trim()

  if (!socket?.connected || !normalizedChatId || joinedChatIds.has(normalizedChatId)) {
    return
  }

  joinedChatIds.add(normalizedChatId)
  socket.emit('chat:join', {
    chatId: normalizedChatId
  })
}

export function startTyping(chatId: string) {
  emitTypingEvent('typing:start', chatId)
}

export function stopTyping(chatId: string) {
  emitTypingEvent('typing:stop', chatId)
}

function emitTypingEvent(event: 'typing:start' | 'typing:stop', chatId: string) {
  const normalizedChatId = chatId.trim()

  if (!socket?.connected || !normalizedChatId) {
    return
  }

  socket.emit(event, {
    chatId: normalizedChatId
  })
}

function getSocketOrigin() {
  return getUrlOrigin(getEnvValue('VITE_APP_SOCKET_URL'))
    || getUrlOrigin(getEnvValue('VITE_APP_API_URL'))
    || window.location.origin
}

function getEnvValue(key: string) {
  const value = import.meta.env[key]

  return typeof value === 'string'
    ? value.trim()
    : ''
}

function getUrlOrigin(value: string) {
  if (!value) {
    return ''
  }

  try {
    return new URL(value, window.location.origin).origin
  } catch {
    return value.replace(/\/api\/?$/, '').replace(/\/+$/, '')
  }
}

function getMessageNewPayload(payload: unknown) {
  const data = getObjectValue(payload, 'message')

  return isMessage(data)
    ? data
    : null
}

function getChatUpdatedPayload(payload: unknown) {
  const data = getObjectValue(payload, 'chat')

  return isChat(data)
    ? data
    : null
}

function getTypingUpdatePayload(payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const data = payload as Partial<TypingUpdatePayload>

  if (typeof data.chatId !== 'string'
    || typeof data.userId !== 'string'
    || typeof data.isTyping !== 'boolean') {
    return null
  }

  return {
    chatId: data.chatId,
    userId: data.userId,
    isTyping: data.isTyping
  }
}

function getObjectValue(payload: unknown, key: string) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  return (payload as Record<string, unknown>)[key]
}

function isMessage(value: unknown): value is IMessage {
  if (!value || typeof value !== 'object') {
    return false
  }

  const message = value as Partial<IMessage>

  return typeof message.id === 'string'
    && typeof message.chatId === 'string'
    && typeof message.content === 'string'
    && typeof message.senderId === 'string'
}

function isChat(value: unknown): value is IChat {
  if (!value || typeof value !== 'object') {
    return false
  }

  const chat = value as Partial<IChat>

  return typeof chat.id === 'string'
    && Array.isArray(chat.participants)
    && typeof chat.unreadCount === 'number'
    && typeof chat.updatedAt === 'string'
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    disconnectChatSocket()
  })
}
