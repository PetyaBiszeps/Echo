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

interface SocketAckResponse {
  ok: boolean
  error?: {
    code: string
    message: string
  }
}

type MessageHandler = (message: IMessage) => void
type ChatHandler = (chat: IChat) => void

const useRealtimeStore = defineStore('realtime', () => {
  const socket = shallowRef<Socket | null>(null)
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)
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
    })

    nextSocket.on('connect_error', (error) => {
      isConnected.value = false
      connectionError.value = error.message
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

    socket.value = nextSocket
  }

  function disconnect() {
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

  return {
    isConnected,
    connectionError,
    setMessageHandler,
    setChatUpdatedHandler,
    connect,
    disconnect,
    joinChat,
    sendMessage
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

export default useRealtimeStore
