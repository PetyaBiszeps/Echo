import useAuthStore from '@/store/auth.ts'
import useAPI from '@/composables/useAPI.ts'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  IChat,
  IMessagePage,
  IMessage
} from '@echo/shared'

type ChatListResponse = {
  success: true
  data: IChat[]
}

type CreateChatResponse = {
  success: true
  data: IChat
}

type ChatMessagesResponse = {
  success: true
  data: IMessage[] | IMessagePage
}

type SendMessageResponse = {
  success: true
  data: IMessage
}

type MarkChatReadResponse = {
  success: true
  data: IChat
}

type FetchMessagesOptions = {
  force?: boolean
}

type MarkChatReadOptions = {
  force?: boolean
}

type UserPresence = {
  isOnline: boolean
  lastSeenAt: string | null
}

type UserPresenceInput = {
  isOnline: boolean
  lastSeenAt?: string | null
}

type MessagePaginationState = {
  nextCursor: string | null
  hasMore: boolean
  isLoadingOlder: boolean
  olderError: string | null
}

const MESSAGE_PAGE_SIZE = 30
const TYPING_STALE_MS = 4000

const useChatStore = defineStore('chats', () => {
  const http = useAPI()
  const auth = useAuthStore()

  const chats = ref<IChat[]>([])
  const isLoadingChats = ref(false)
  const chatListError = ref<string | null>(null)
  const messagesByChatId = ref<Record<string, IMessage[]>>({})
  const loadedMessagesByChatId = ref<Record<string, boolean>>({})
  const loadingMessagesByChatId = ref<Record<string, boolean>>({})
  const messageErrorsByChatId = ref<Record<string, string | null>>({})
  const messagePaginationByChatId = ref<Record<string, MessagePaginationState>>({})
  const sendingByChatId = ref<Record<string, boolean>>({})
  const sendErrorsByChatId = ref<Record<string, string | null>>({})
  const markingReadByChatId = ref<Record<string, boolean>>({})
  const isCreatingDirectChat = ref(false)
  const createDirectChatError = ref<string | null>(null)
  const typingByChatId = ref<Record<string, Record<string, boolean>>>({})
  const presenceByUserId = ref<Record<string, UserPresence>>({})
  const typingTimers = new Map<string, ReturnType<typeof setTimeout>>()

  const hasChats = computed(() => chats.value.length > 0)

  async function fetchChats() {
    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      chats.value = []
      chatListError.value = 'Sign in again to load your chats.'
      return
    }

    isLoadingChats.value = true
    chatListError.value = null

    try {
      const response = await http.get<ChatListResponse>('/chats', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      chats.value = response.data
    } catch {
      chatListError.value = 'Unable to load chats. Please try again.'
    } finally {
      isLoadingChats.value = false
    }
  }

  async function fetchMessages(chatId: string, options: FetchMessagesOptions = {}) {
    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      messageErrorsByChatId.value = {
        ...messageErrorsByChatId.value,
        [chatId]: 'Sign in again to load messages.'
      }
      return false
    }

    if (!options.force && loadedMessagesByChatId.value[chatId]) {
      return true
    }

    loadingMessagesByChatId.value = {
      ...loadingMessagesByChatId.value,
      [chatId]: true
    }
    messageErrorsByChatId.value = {
      ...messageErrorsByChatId.value,
      [chatId]: null
    }

    try {
      const response = await http.get<ChatMessagesResponse>(`/chats/${chatId}/messages`, {
        query: {
          limit: MESSAGE_PAGE_SIZE
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const page = getMessagePage(response.data)

      messagesByChatId.value = {
        ...messagesByChatId.value,
        [chatId]: page.messages
      }
      setMessagePagination(chatId, {
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
        isLoadingOlder: false,
        olderError: null
      })
      loadedMessagesByChatId.value = {
        ...loadedMessagesByChatId.value,
        [chatId]: true
      }
      return true
    } catch {
      messageErrorsByChatId.value = {
        ...messageErrorsByChatId.value,
        [chatId]: 'Unable to load messages. Please try again.'
      }
      return false
    } finally {
      loadingMessagesByChatId.value = {
        ...loadingMessagesByChatId.value,
        [chatId]: false
      }
    }
  }

  async function fetchOlderMessages(chatId: string) {
    const pagination = getMessagePagination(chatId)

    if (!pagination.hasMore || !pagination.nextCursor || pagination.isLoadingOlder) {
      return false
    }

    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      setMessagePagination(chatId, {
        ...pagination,
        olderError: 'Sign in again to load older messages.'
      })
      return false
    }

    setMessagePagination(chatId, {
      ...pagination,
      isLoadingOlder: true,
      olderError: null
    })

    try {
      const response = await http.get<ChatMessagesResponse>(`/chats/${chatId}/messages`, {
        query: {
          before: pagination.nextCursor,
          limit: MESSAGE_PAGE_SIZE
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const page = getMessagePage(response.data)

      prependMessages(chatId, page.messages)
      setMessagePagination(chatId, {
        nextCursor: page.nextCursor,
        hasMore: page.hasMore,
        isLoadingOlder: false,
        olderError: null
      })
      return true
    } catch {
      setMessagePagination(chatId, {
        ...pagination,
        isLoadingOlder: false,
        olderError: 'Unable to load older messages. Please try again.'
      })
      return false
    }
  }

  async function markChatRead(chatId: string, options: MarkChatReadOptions = {}) {
    const chat = chats.value.find(item => item.id === chatId)

    if ((!options.force && chat?.unreadCount === 0) || markingReadByChatId.value[chatId]) {
      return
    }

    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      return
    }

    markingReadByChatId.value = {
      ...markingReadByChatId.value,
      [chatId]: true
    }

    try {
      const response = await http.post<MarkChatReadResponse>(`/chats/${chatId}/read`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      upsertChat({
        ...response.data,
        unreadCount: 0
      })
    } catch {
      // Mark-read is best-effort UI sync; message viewing should not be interrupted.
    } finally {
      markingReadByChatId.value = {
        ...markingReadByChatId.value,
        [chatId]: false
      }
    }
  }

  async function createDirectChat(username: string) {
    const normalizedUsername = username.trim()

    if (!normalizedUsername) {
      createDirectChatError.value = 'Choose a user to start a chat.'
      return null
    }

    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      createDirectChatError.value = 'Sign in again to start a chat.'
      return null
    }

    if (isCreatingDirectChat.value) {
      return null
    }

    isCreatingDirectChat.value = true
    createDirectChatError.value = null

    try {
      const response = await http.post<CreateChatResponse>('/chats', {
        body: {
          username: normalizedUsername
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      upsertChat(response.data)

      return response.data
    } catch {
      createDirectChatError.value = 'Unable to start chat. Please try again.'
      return null
    } finally {
      isCreatingDirectChat.value = false
    }
  }

  function clearCreateDirectChatError() {
    createDirectChatError.value = null
  }

  async function sendMessage(chatId: string, content: string) {
    const normalizedContent = content.trim()

    if (!normalizedContent) {
      return null
    }

    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      sendErrorsByChatId.value = {
        ...sendErrorsByChatId.value,
        [chatId]: 'Sign in again to send messages.'
      }
      return null
    }

    if (sendingByChatId.value[chatId]) {
      return null
    }

    sendingByChatId.value = {
      ...sendingByChatId.value,
      [chatId]: true
    }
    sendErrorsByChatId.value = {
      ...sendErrorsByChatId.value,
      [chatId]: null
    }

    try {
      const response = await http.post<SendMessageResponse>(`/chats/${chatId}/messages`, {
        body: {
          content: normalizedContent
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      const message = response.data

      appendMessage(chatId, message)
      updateChatPreview(chatId, message)

      return message
    } catch {
      sendErrorsByChatId.value = {
        ...sendErrorsByChatId.value,
        [chatId]: 'Unable to send message. Please try again.'
      }
      return null
    } finally {
      sendingByChatId.value = {
        ...sendingByChatId.value,
        [chatId]: false
      }
    }
  }

  function updateChatPreview(chatId: string, message: IMessage) {
    const chat = chats.value.find(item => item.id === chatId)

    if (!chat) {
      return
    }

    const updatedAt = message.timestamp || message.createdAt || new Date().toISOString()
    const updatedChat: IChat = {
      ...chat,
      latestMessage: message,
      lastMessage: message,
      updatedAt
    }

    chats.value = [
      updatedChat,
      ...chats.value.filter(item => item.id !== chatId)
    ]
  }

  function appendMessage(chatId: string, message: IMessage) {
    const messages = messagesByChatId.value[chatId] ?? []

    if (messages.some(item => item.id === message.id)) {
      messagesByChatId.value = {
        ...messagesByChatId.value,
        [chatId]: messages
      }
      return false
    }

    messagesByChatId.value = {
      ...messagesByChatId.value,
      [chatId]: [...messages, message]
    }
    return true
  }

  function prependMessages(chatId: string, messages: IMessage[]) {
    const existingMessages = messagesByChatId.value[chatId] ?? []
    const existingMessageIds = new Set(existingMessages.map(message => message.id))
    const newMessages = messages.filter(message => !existingMessageIds.has(message.id))

    if (newMessages.length === 0) {
      return false
    }

    messagesByChatId.value = {
      ...messagesByChatId.value,
      [chatId]: [...newMessages, ...existingMessages]
    }
    return true
  }

  function applyMessage(message: IMessage) {
    const chatId = typeof message.chatId === 'string'
      ? message.chatId.trim()
      : ''

    if (!chatId) {
      return false
    }

    setUserTyping(chatId, message.senderId, false)

    return appendMessage(chatId, message)
  }

  function setUserTyping(chatId: string, userId: string, isTyping: boolean) {
    const normalizedChatId = chatId.trim()
    const normalizedUserId = userId.trim()

    if (!normalizedChatId || !normalizedUserId) {
      return
    }

    clearTypingTimer(normalizedChatId, normalizedUserId)

    if (!isTyping) {
      const chatTyping = typingByChatId.value[normalizedChatId] ?? {}
      const nextChatTyping = {
        ...chatTyping
      }

      delete nextChatTyping[normalizedUserId]

      typingByChatId.value = Object.keys(nextChatTyping).length > 0
        ? {
          ...typingByChatId.value,
          [normalizedChatId]: nextChatTyping
        }
        : removeTypingChat(normalizedChatId)
      return
    }

    typingByChatId.value = {
      ...typingByChatId.value,
      [normalizedChatId]: {
        ...typingByChatId.value[normalizedChatId],
        [normalizedUserId]: true
      }
    }
    typingTimers.set(getTypingTimerKey(normalizedChatId, normalizedUserId), setTimeout(() => {
      setUserTyping(normalizedChatId, normalizedUserId, false)
    }, TYPING_STALE_MS))
  }

  function clearAllTyping() {
    typingTimers.forEach(timer => clearTimeout(timer))
    typingTimers.clear()
    typingByChatId.value = {}
  }

  function setUserPresence(userId: string, presence: UserPresenceInput) {
    const normalizedUserId = userId.trim()

    if (!normalizedUserId) {
      return
    }

    const existingPresence = presenceByUserId.value[normalizedUserId]

    presenceByUserId.value = {
      ...presenceByUserId.value,
      [normalizedUserId]: {
        isOnline: presence.isOnline,
        lastSeenAt: presence.lastSeenAt ?? existingPresence?.lastSeenAt ?? null
      }
    }
  }

  function clearPresence() {
    presenceByUserId.value = {}
  }

  function getDirectChatPeer(chat: IChat | null | undefined) {
    const currentUserId = auth.user?.id

    if (!chat || !currentUserId || chat.participants.length > 2) {
      return null
    }

    return chat.participants.find(participant => participant.id !== currentUserId) ?? null
  }

  function getDirectChatPeerPresence(chat: IChat | null | undefined) {
    const peer = getDirectChatPeer(chat)

    if (!peer) {
      return null
    }

    const presence = presenceByUserId.value[peer.id]

    return {
      isOnline: presence?.isOnline ?? false,
      lastSeenAt: presence?.lastSeenAt ?? peer.lastSeenAt ?? null
    }
  }

  function getTypingUserIds(chatId: string, excludeUserId?: string | null) {
    const normalizedChatId = chatId.trim()

    if (!normalizedChatId) {
      return []
    }

    return Object.entries(typingByChatId.value[normalizedChatId] ?? {})
      .filter(([userId, isTyping]) => isTyping && userId !== excludeUserId)
      .map(([userId]) => userId)
  }

  function upsertChat(updatedChat: IChat) {
    const existingChat = chats.value.find(chat => chat.id === updatedChat.id)
    const nextChat = existingChat
      ? {
        ...existingChat,
        ...updatedChat
      }
      : updatedChat

    chats.value = [
      nextChat,
      ...chats.value.filter(chat => chat.id !== updatedChat.id)
    ].sort(sortChatsByUpdatedAt)
  }

  function sortChatsByUpdatedAt(a: IChat, b: IChat) {
    return getChatUpdatedTime(b) - getChatUpdatedTime(a)
  }

  function getChatUpdatedTime(chat: IChat) {
    const time = new Date(chat.updatedAt).getTime()

    return Number.isNaN(time)
      ? 0
      : time
  }

  function clearTypingTimer(chatId: string, userId: string) {
    const key = getTypingTimerKey(chatId, userId)
    const timer = typingTimers.get(key)

    if (!timer) {
      return
    }

    clearTimeout(timer)
    typingTimers.delete(key)
  }

  function removeTypingChat(chatId: string) {
    const nextTypingByChatId = {
      ...typingByChatId.value
    }

    delete nextTypingByChatId[chatId]

    return nextTypingByChatId
  }

  function getTypingTimerKey(chatId: string, userId: string) {
    return `${chatId}:${userId}`
  }

  function getMessagePagination(chatId: string): MessagePaginationState {
    return messagePaginationByChatId.value[chatId] ?? {
      nextCursor: null,
      hasMore: false,
      isLoadingOlder: false,
      olderError: null
    }
  }

  function setMessagePagination(chatId: string, pagination: MessagePaginationState) {
    messagePaginationByChatId.value = {
      ...messagePaginationByChatId.value,
      [chatId]: pagination
    }
  }

  function getMessagePage(data: IMessage[] | IMessagePage): IMessagePage {
    if (Array.isArray(data)) {
      return {
        messages: data,
        nextCursor: null,
        hasMore: false
      }
    }

    return data
  }

  return {
    chats, isLoadingChats, chatListError, hasChats,
    messagesByChatId, loadingMessagesByChatId, messageErrorsByChatId,
    messagePaginationByChatId,
    sendingByChatId, sendErrorsByChatId,
    isCreatingDirectChat, createDirectChatError,
    typingByChatId, presenceByUserId,
    fetchChats, fetchMessages, fetchOlderMessages, sendMessage, markChatRead,
    createDirectChat, clearCreateDirectChatError,
    applyMessage, upsertChat,
    setUserTyping, clearAllTyping, getTypingUserIds,
    setUserPresence, clearPresence, getDirectChatPeer, getDirectChatPeerPresence
  }
})

export default useChatStore
