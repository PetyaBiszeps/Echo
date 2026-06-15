import getErrorMessage from '@/utils/getErrorMessage'
import useToastStore from '@/stores/toast'
import useRealtimeStore from '@/stores/realtime'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
  IChat,
  IMessage
} from '@echo/shared'

interface ChatReadPayload {
  chatId: string
  userId: string
  readAt: string
}

const useChatStore = defineStore('chats', () => {
  const toaster = useToastStore()
  const chatList = ref<IChat[]>([])
  const selectedChatId = ref<string | null>(null)
  const messagesByChat = ref<Record<string, IMessage[]>>({})
  const messagesLoading = ref(false)
  const messagesError = ref<string | null>(null)
  const sendingError = ref<string | null>(null)
  const sendingMessage = ref(false)
  const creatingChat = ref(false)
  const markReadInFlight = new Set<string>()
  const markReadPending = new Set<string>()
  const markReadRequestIds = new Map<string, number>()
  let messagesLoadRequestId = 0
  let markReadRequestId = 0

  const getChat = computed(() => {
    return chatList.value.find(chat => chat.id === selectedChatId.value) ?? null
  })

  const currentMessages = computed(() => {
    return selectedChatId.value
      ? messagesByChat.value[selectedChatId.value] ?? []
      : []
  })

  function selectChat(chatId: string) {
    selectedChatId.value = chatId
    void useRealtimeStore().joinChat(chatId)
  }

  function clearSelectedChat() {
    messagesLoadRequestId += 1
    markReadRequestId += 1
    markReadInFlight.clear()
    markReadPending.clear()
    markReadRequestIds.clear()
    selectedChatId.value = null
    messagesError.value = null
    sendingError.value = null
    messagesLoading.value = false
  }

  function setChat(newChatList: IChat[]) {
    chatList.value = sortChats(newChatList)
  }

  function setMessages(chatId: string, messages: IMessage[]) {
    messagesByChat.value = {
      ...messagesByChat.value,
      [chatId]: messages
    }
  }

  function resetChatState() {
    messagesLoadRequestId += 1
    markReadRequestId += 1
    markReadInFlight.clear()
    markReadPending.clear()
    markReadRequestIds.clear()
    chatList.value = []
    selectedChatId.value = null
    messagesByChat.value = {}
    messagesLoading.value = false
    messagesError.value = null
    sendingError.value = null
    sendingMessage.value = false
    creatingChat.value = false
  }

  async function loadChats() {
    try {
      const { data } = await http.get('/chats')

      const chats: IChat[] = data.data.map((chat: IChat) => normalizeChat(chat))

      setChat(chats)
    } catch (err: unknown) {
      toaster.addToaster({
        type: 'error',
        message: getErrorMessage(err)
      })
    }
  }

  async function createChat(username: string) {
    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      toaster.addToaster({
        type: 'error',
        message: 'Username is required'
      })

      return null
    }

    try {
      creatingChat.value = true

      const { data } = await http.post('/chats', {
        username: normalizedUsername
      })
      const chat = normalizeChat(data.data as IChat)
      const exists = chatList.value.some(item => item.id === chat.id)

      chatList.value = sortChats(exists
        ? chatList.value.map(item => item.id === chat.id ? chat : item)
        : [chat, ...chatList.value])
      selectChat(chat.id)
      await loadMessages(chat.id)

      return chat
    } catch (err: unknown) {
      toaster.addToaster({
        type: 'error',
        message: getErrorMessage(err)
      })

      return null
    } finally {
      creatingChat.value = false
    }
  }

  async function loadMessages(chatId: string) {
    const requestId = ++messagesLoadRequestId

    try {
      messagesLoading.value = true
      messagesError.value = null

      const { data } = await http.get(`/chats/${chatId}/messages`)
      const messages: IMessage[] = data.data.map((message: IMessage) => normalizeMessage(message))

      if (!isCurrentMessageLoad(requestId, chatId)) {
        return true
      }

      setMessages(chatId, messages)

      return true
    } catch (err: unknown) {
      if (!isCurrentMessageLoad(requestId, chatId)) {
        return true
      }

      const message = getErrorMessage(err)

      messagesError.value = message
      toaster.addToaster({
        type: 'error',
        message
      })

      return false
    } finally {
      if (requestId === messagesLoadRequestId) {
        messagesLoading.value = false
      }
    }
  }

  async function markChatRead(chatId: string) {
    if (selectedChatId.value !== chatId) {
      return null
    }

    if (markReadInFlight.has(chatId)) {
      markReadPending.add(chatId)
      return null
    }

    const requestId = ++markReadRequestId

    markReadInFlight.add(chatId)
    markReadRequestIds.set(chatId, requestId)

    try {
      const { data } = await http.post(`/chats/${chatId}/read`)
      const chat = normalizeChat(data.data as IChat)

      if (isCurrentMarkRead(requestId, chatId)) {
        upsertChat(chat)
      }

      return chat
    } catch {
      return null
    } finally {
      if (markReadRequestIds.get(chatId) === requestId) {
        markReadRequestIds.delete(chatId)
        markReadInFlight.delete(chatId)

        if (markReadPending.delete(chatId) && selectedChatId.value === chatId) {
          void markChatRead(chatId)
        }
      }
    }
  }

  async function sendMessage(chatId: string, content: string) {
    const normalizedContent = content.trim()

    if (!normalizedContent) {
      return null
    }

    try {
      sendingMessage.value = true
      sendingError.value = null

      const realtimeStore = useRealtimeStore()

      if (realtimeStore.isConnected) {
        const sent = await realtimeStore.sendMessage(chatId, normalizedContent)

        if (sent) {
          return true
        }

        const message = realtimeStore.connectionError ?? 'Unable to send message'

        sendingError.value = message
        toaster.addToaster({
          type: 'error',
          message
        })

        return null
      }

      const { data } = await http.post(`/chats/${chatId}/messages`, {
        content: normalizedContent
      })
      const message = normalizeMessage(data.data as IMessage)

      receiveMessage(message)

      return message
    } catch (err: unknown) {
      const message = getErrorMessage(err)

      sendingError.value = message
      toaster.addToaster({
        type: 'error',
        message
      })

      return null
    } finally {
      sendingMessage.value = false
    }
  }

  function receiveMessage(message: IMessage) {
    if (!message.chatId) {
      return null
    }

    const normalizedMessage = normalizeMessage(message)
    const messages = messagesByChat.value[message.chatId] ?? []

    if (!messages.some(item => item.id === normalizedMessage.id)) {
      setMessages(message.chatId, [
        ...messages,
        normalizedMessage
      ])
    }

    updateChatLastMessage(message.chatId, normalizedMessage)

    if (message.chatId === selectedChatId.value) {
      updateChatUnreadCount(message.chatId, 0)
      void markChatRead(message.chatId)
    }

    return normalizedMessage
  }

  function receiveChatUpdate(chat: IChat) {
    const normalizedChat = normalizeChat(chat)
    const exists = upsertChat(normalizedChat)

    if (normalizedChat.id === selectedChatId.value && normalizedChat.unreadCount > 0) {
      updateChatUnreadCount(normalizedChat.id, 0)
      void markChatRead(normalizedChat.id)
    }

    if (!exists) {
      void useRealtimeStore().joinChat(normalizedChat.id)
    }

    return normalizedChat
  }

  function receiveChatRead(payload: ChatReadPayload, currentUserId: string | null | undefined) {
    if (!currentUserId || payload.userId === currentUserId) {
      return
    }

    const messages = messagesByChat.value[payload.chatId]
    const readTime = new Date(payload.readAt).getTime()

    if (!messages || Number.isNaN(readTime)) {
      return
    }

    let changed = false
    const nextMessages = messages.map(message => {
      if (message.senderId !== currentUserId || message.isReadByPeer) {
        return message
      }

      const messageTime = new Date(message.createdAt ?? message.timestamp).getTime()

      if (Number.isNaN(messageTime) || messageTime > readTime) {
        return message
      }

      changed = true

      return {
        ...message,
        isReadByPeer: true
      }
    })

    if (changed) {
      setMessages(payload.chatId, nextMessages)
    }
  }

  function normalizeMessage(message: IMessage): IMessage {
    const timestamp = new Date(message.timestamp).toISOString()

    return {
      ...message,
      createdAt: message.createdAt
        ? new Date(message.createdAt).toISOString()
        : timestamp,
      timestamp
    }
  }

  function normalizeChat(chat: IChat): IChat {
    const lastMessage = chat.lastMessage
      ? normalizeMessage(chat.lastMessage)
      : null

    return {
      ...chat,
      createdAt: new Date(chat.createdAt).toISOString(),
      updatedAt: new Date(chat.updatedAt).toISOString(),
      unreadCount: chat.unreadCount ?? 0,
      lastMessage,
      latestMessage: chat.latestMessage
        ? normalizeMessage(chat.latestMessage)
        : lastMessage
    }
  }

  function updateChatLastMessage(chatId: string, message: IMessage) {
    chatList.value = sortChats(chatList.value.map(chat => {
      if (chat.id !== chatId) {
        return chat
      }

      return {
        ...chat,
        lastMessage: message,
        latestMessage: message,
        updatedAt: message.createdAt ?? message.timestamp
      }
    }))
  }

  function updateChatUnreadCount(chatId: string, unreadCount: number) {
    chatList.value = chatList.value.map(chat => {
      if (chat.id !== chatId) {
        return chat
      }

      return {
        ...chat,
        unreadCount
      }
    })
  }

  function upsertChat(chat: IChat) {
    const exists = chatList.value.some(item => item.id === chat.id)

    chatList.value = sortChats([
      chat,
      ...chatList.value.filter(item => item.id !== chat.id)
    ])

    return exists
  }

  function sortChats(chats: IChat[]) {
    return [...chats].sort((a, b) => getChatActivityTime(b) - getChatActivityTime(a))
  }

  function getChatActivityTime(chat: IChat) {
    const value = chat.latestMessage?.timestamp
      ?? chat.latestMessage?.createdAt
      ?? chat.lastMessage?.timestamp
      ?? chat.lastMessage?.createdAt
      ?? chat.updatedAt

    const time = new Date(value).getTime()

    return Number.isNaN(time) ? 0 : time
  }

  function isCurrentMessageLoad(requestId: number, chatId: string) {
    return requestId === messagesLoadRequestId && selectedChatId.value === chatId
  }

  function isCurrentMarkRead(requestId: number, chatId: string) {
    return markReadRequestIds.get(chatId) === requestId && selectedChatId.value === chatId
  }

  return {
    chatList,
    selectedChatId,
    messagesByChat,
    messagesLoading,
    messagesError,
    sendingError,
    sendingMessage,
    creatingChat,
    getChat,
    currentMessages,
    setChat,
    selectChat,
    clearSelectedChat,
    resetChatState,
    createChat,
    loadChats,
    loadMessages,
    markChatRead,
    receiveChatUpdate,
    receiveChatRead,
    receiveMessage,
    sendMessage
  }
}, {
  persist: true
})

export default useChatStore
