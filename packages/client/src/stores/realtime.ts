import { defineStore } from 'pinia'
import { shallowRef, ref } from 'vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type {
  IChat,
  IMessage
} from '@echo/shared'

interface MessageNewPayload {
  message?: IMessage
}

interface ChatUpdatedPayload {
  chat?: IChat
}

interface ChatReadPayload {
  chatId?: string
  userId?: string
  readAt?: string
}

interface TypingUpdatePayload {
  chatId?: string
  userId?: string
  isTyping?: boolean
}

interface PresenceUpdatePayload {
  userId?: string
  isOnline?: boolean
}

interface SocketAckResponse {
  ok: boolean
  error?: {
    code: string
    message: string
  }
}

type MessageHandler = (message: IMessage) => void
type ChatHandler = (chat: IChat) => void
type ChatReadHandler = (payload: Required<ChatReadPayload>) => void
type AuthErrorHandler = () => void

const TYPING_EXPIRY_MS = 5000

const useRealtimeStore = defineStore('realtime', () => {
  const socket = shallowRef<Socket | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const typingByChat = ref<Record<string, string[]>>({})
  const presenceByUserId = ref<Record<string, boolean>>({})
  const typingExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const localTypingChatIds = new Set<string>()
  let messageHandler: MessageHandler | null = null
  let chatUpdatedHandler: ChatHandler | null = null
  let chatReadHandler: ChatReadHandler | null = null
  let authErrorHandler: AuthErrorHandler | null = null

  function setMessageHandler(handler: MessageHandler) {
    messageHandler = handler
  }

  function setChatUpdatedHandler(handler: ChatHandler) {
    chatUpdatedHandler = handler
  }

  function setChatReadHandler(handler: ChatReadHandler) {
    chatReadHandler = handler
  }

  function setAuthErrorHandler(handler: AuthErrorHandler) {
    authErrorHandler = handler
  }

  function connect(accessToken: string | null | undefined) {
    const token = accessToken?.trim()

    if (!token) {
      return
    }

    if (socket.value?.connected && socket.value.auth?.token === token) {
      return
    }

    disconnect()

    const nextSocket = io(getSocketUrl(), {
      auth: {
        token
      },
      withCredentials: true
    })

    nextSocket.on('connect', () => {
      isConnected.value = true
      connectionError.value = null
    })

    nextSocket.on('disconnect', () => {
      isConnected.value = false
      localTypingChatIds.clear()
      clearAllTypingState()
      clearPresenceState()
    })

    nextSocket.on('connect_error', (error) => {
      isConnected.value = false
      connectionError.value = error.message
      localTypingChatIds.clear()
      clearAllTypingState()
      clearPresenceState()

      if (isAuthConnectionError(error.message)) {
        authErrorHandler?.()
      }
    })

    nextSocket.on('message:new', (payload: MessageNewPayload) => {
      if (isMessage(payload?.message)) {
        messageHandler?.(payload.message)
      }
    })

    nextSocket.on('chat:updated', (payload: ChatUpdatedPayload) => {
      if (isChat(payload?.chat)) {
        chatUpdatedHandler?.(payload.chat)
      }
    })

    nextSocket.on('chat:read', (payload: ChatReadPayload) => {
      if (isChatReadPayload(payload)) {
        chatReadHandler?.(payload)
      }
    })

    nextSocket.on('typing:update', (payload: TypingUpdatePayload) => {
      if (!isTypingUpdatePayload(payload)) {
        return
      }

      if (payload.isTyping) {
        setTypingUser(payload.chatId, payload.userId)
        return
      }

      clearTypingUser(payload.chatId, payload.userId)
    })

    nextSocket.on('presence:update', (payload: PresenceUpdatePayload) => {
      if (!isPresenceUpdatePayload(payload)) {
        return
      }

      presenceByUserId.value = {
        ...presenceByUserId.value,
        [payload.userId]: payload.isOnline
      }
    })

    socket.value = nextSocket
  }

  function disconnect() {
    stopAllTyping()
    clearAllTypingState()
    clearPresenceState()
    socket.value?.removeAllListeners()
    socket.value?.disconnect()
    socket.value = null
    isConnected.value = false
  }

  async function joinChat(chatId: string) {
    const normalizedChatId = chatId.trim()

    if (!normalizedChatId || !socket.value?.connected) {
      return false
    }

    return emitWithAck('chat:join', {
      chatId: normalizedChatId
    })
  }

  async function sendMessage(chatId: string, content: string) {
    const normalizedChatId = chatId.trim()
    const normalizedContent = content.trim()

    if (!normalizedChatId || !normalizedContent || !socket.value?.connected) {
      return false
    }

    return emitWithAck('message:send', {
      chatId: normalizedChatId,
      content: normalizedContent
    })
  }

  function emitWithAck(event: string, payload: object) {
    const activeSocket = socket.value

    if (!activeSocket?.connected) {
      return Promise.resolve(false)
    }

    return new Promise<boolean>((resolve) => {
      activeSocket.timeout(10000).emit(event, payload, (error: Error | null, response?: SocketAckResponse) => {
        if (error || !response?.ok) {
          connectionError.value = response?.error?.message ?? error?.message ?? 'Socket request failed'
          resolve(false)
          return
        }

        connectionError.value = null
        resolve(true)
      })
    })
  }

  function startTyping(chatId: string) {
    const normalizedChatId = chatId.trim()

    if (!normalizedChatId || localTypingChatIds.has(normalizedChatId)) {
      return false
    }

    if (!emitTypingEvent('typing:start', normalizedChatId)) {
      return false
    }

    localTypingChatIds.add(normalizedChatId)

    return true
  }

  function stopTyping(chatId: string) {
    const normalizedChatId = chatId.trim()

    if (!normalizedChatId) {
      return false
    }

    const wasTyping = localTypingChatIds.delete(normalizedChatId)

    if (!wasTyping) {
      return false
    }

    return emitTypingEvent('typing:stop', normalizedChatId)
  }

  function stopAllTyping() {
    const chatIds = Array.from(localTypingChatIds)

    localTypingChatIds.clear()
    chatIds.forEach(chatId => {
      emitTypingEvent('typing:stop', chatId)
    })
  }

  function getTypingUserIds(chatId: string) {
    return typingByChat.value[chatId.trim()] ?? []
  }

  function isUserOnline(userId: string) {
    return Boolean(presenceByUserId.value[userId.trim()])
  }

  function emitTypingEvent(event: 'typing:start' | 'typing:stop', chatId: string) {
    const activeSocket = socket.value

    if (!activeSocket?.connected) {
      return false
    }

    activeSocket.emit(event, {
      chatId
    })

    return true
  }

  function setTypingUser(chatId: string, userId: string) {
    const users = typingByChat.value[chatId] ?? []

    if (!users.includes(userId)) {
      typingByChat.value = {
        ...typingByChat.value,
        [chatId]: [
          ...users,
          userId
        ]
      }
    }

    refreshTypingExpiry(chatId, userId)
  }

  function clearTypingUser(chatId: string, userId: string) {
    clearTypingExpiry(chatId, userId)

    const users = typingByChat.value[chatId]

    if (!users?.includes(userId)) {
      return
    }

    const nextUsers = users.filter(item => item !== userId)

    if (nextUsers.length > 0) {
      typingByChat.value = {
        ...typingByChat.value,
        [chatId]: nextUsers
      }
      return
    }

    const nextTypingByChat = {
      ...typingByChat.value
    }

    delete nextTypingByChat[chatId]
    typingByChat.value = nextTypingByChat
  }

  function refreshTypingExpiry(chatId: string, userId: string) {
    clearTypingExpiry(chatId, userId)

    typingExpiryTimers.set(getTypingKey(chatId, userId), setTimeout(() => {
      clearTypingUser(chatId, userId)
    }, TYPING_EXPIRY_MS))
  }

  function clearTypingExpiry(chatId: string, userId: string) {
    const key = getTypingKey(chatId, userId)
    const timer = typingExpiryTimers.get(key)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    typingExpiryTimers.delete(key)
  }

  function clearAllTypingState() {
    typingExpiryTimers.forEach(timer => clearTimeout(timer))
    typingExpiryTimers.clear()
    typingByChat.value = {}
  }

  function clearPresenceState() {
    presenceByUserId.value = {}
  }

  return {
    isConnected,
    connectionError,
    typingByChat,
    presenceByUserId,
    setMessageHandler,
    setChatUpdatedHandler,
    setChatReadHandler,
    setAuthErrorHandler,
    connect,
    disconnect,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    stopAllTyping,
    getTypingUserIds,
    isUserOnline,
    clearPresenceState
  }
})

function getSocketUrl() {
  const wsUrl = import.meta.env.VITE_APP_WS_URL?.trim()

  if (wsUrl) {
    return wsUrl
  }

  const apiUrl = import.meta.env.VITE_APP_API_URL?.trim()

  if (apiUrl) {
    return apiUrl.replace(/\/api\/?$/, '')
  }

  return 'http://localhost:3001'
}

function isAuthConnectionError(message: string) {
  const normalizedMessage = message.toLowerCase()

  return normalizedMessage.includes('token')
    || normalizedMessage.includes('authorization')
    || normalizedMessage.includes('authentication')
}

function isChat(chat: unknown): chat is IChat {
  return typeof chat === 'object'
    && chat !== null
    && typeof (chat as IChat).id === 'string'
    && Array.isArray((chat as IChat).participants)
}

function isMessage(message: unknown): message is IMessage {
  return typeof message === 'object'
    && message !== null
    && typeof (message as IMessage).id === 'string'
    && typeof (message as IMessage).chatId === 'string'
    && typeof (message as IMessage).senderId === 'string'
    && typeof (message as IMessage).content === 'string'
}

function isChatReadPayload(payload: unknown): payload is Required<ChatReadPayload> {
  return typeof payload === 'object'
    && payload !== null
    && typeof (payload as ChatReadPayload).chatId === 'string'
    && Boolean((payload as ChatReadPayload).chatId?.trim())
    && typeof (payload as ChatReadPayload).userId === 'string'
    && Boolean((payload as ChatReadPayload).userId?.trim())
    && typeof (payload as ChatReadPayload).readAt === 'string'
    && Boolean((payload as ChatReadPayload).readAt?.trim())
}

function isTypingUpdatePayload(payload: unknown): payload is Required<TypingUpdatePayload> {
  return typeof payload === 'object'
    && payload !== null
    && typeof (payload as TypingUpdatePayload).chatId === 'string'
    && Boolean((payload as TypingUpdatePayload).chatId?.trim())
    && typeof (payload as TypingUpdatePayload).userId === 'string'
    && Boolean((payload as TypingUpdatePayload).userId?.trim())
    && typeof (payload as TypingUpdatePayload).isTyping === 'boolean'
}

function isPresenceUpdatePayload(payload: unknown): payload is Required<PresenceUpdatePayload> {
  return typeof payload === 'object'
    && payload !== null
    && typeof (payload as PresenceUpdatePayload).userId === 'string'
    && Boolean((payload as PresenceUpdatePayload).userId?.trim())
    && typeof (payload as PresenceUpdatePayload).isOnline === 'boolean'
}

function getTypingKey(chatId: string, userId: string) {
  return `${chatId}:${userId}`
}

export default useRealtimeStore
