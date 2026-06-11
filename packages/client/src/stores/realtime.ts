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

interface TypingUpdatePayload {
  chatId?: string
  userId?: string
  isTyping?: boolean
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

const TYPING_EXPIRY_MS = 5000

const useRealtimeStore = defineStore('realtime', () => {
  const socket = shallowRef<Socket | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
  const typingByChat = ref<Record<string, string[]>>({})
  const typingExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const localTypingChatIds = new Set<string>()
  let messageHandler: MessageHandler | null = null
  let chatUpdatedHandler: ChatHandler | null = null

  function setMessageHandler(handler: MessageHandler) {
    messageHandler = handler
  }

  function setChatUpdatedHandler(handler: ChatHandler) {
    chatUpdatedHandler = handler
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
    })

    nextSocket.on('connect_error', (error) => {
      isConnected.value = false
      connectionError.value = error.message
      localTypingChatIds.clear()
      clearAllTypingState()
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

    socket.value = nextSocket
  }

  function disconnect() {
    stopAllTyping()
    clearAllTypingState()
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

  return {
    isConnected,
    connectionError,
    typingByChat,
    setMessageHandler,
    setChatUpdatedHandler,
    connect,
    disconnect,
    joinChat,
    sendMessage,
    startTyping,
    stopTyping,
    stopAllTyping,
    getTypingUserIds
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

function isTypingUpdatePayload(payload: unknown): payload is Required<TypingUpdatePayload> {
  return typeof payload === 'object'
    && payload !== null
    && typeof (payload as TypingUpdatePayload).chatId === 'string'
    && Boolean((payload as TypingUpdatePayload).chatId?.trim())
    && typeof (payload as TypingUpdatePayload).userId === 'string'
    && Boolean((payload as TypingUpdatePayload).userId?.trim())
    && typeof (payload as TypingUpdatePayload).isTyping === 'boolean'
}

function getTypingKey(chatId: string, userId: string) {
  return `${chatId}:${userId}`
}

export default useRealtimeStore
