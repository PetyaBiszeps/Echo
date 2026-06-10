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

const useChatStore = defineStore('chats', () => {
  const toaster = useToastStore()
  const chatList = ref<IChat[]>([])
  const selectedChatId = ref<string | null>(null)
  const messagesByChat = ref<Record<string, IMessage[]>>({})
  const messagesLoading = ref(false)
  const messagesError = ref<string | null>(null)
  const sendingMessage = ref(false)
  const creatingChat = ref(false)

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

  function setChat(newChatList: IChat[]) {
    chatList.value = newChatList
  }

  function setMessages(chatId: string, messages: IMessage[]) {
    messagesByChat.value = {
      ...messagesByChat.value,
      [chatId]: messages
    }
  }

  function resetChatState() {
    chatList.value = []
    selectedChatId.value = null
    messagesByChat.value = {}
    messagesLoading.value = false
    messagesError.value = null
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

      chatList.value = exists
        ? chatList.value.map(item => item.id === chat.id ? chat : item)
        : [chat, ...chatList.value]
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
    try {
      messagesLoading.value = true
      messagesError.value = null

      const { data } = await http.get(`/chats/${chatId}/messages`)
      const messages: IMessage[] = data.data.map((message: IMessage) => normalizeMessage(message))

      setMessages(chatId, messages)
    } catch (err: unknown) {
      const message = getErrorMessage(err)

      messagesError.value = message
      toaster.addToaster({
        type: 'error',
        message
      })
    } finally {
      messagesLoading.value = false
    }
  }

  async function sendMessage(chatId: string, content: string) {
    const normalizedContent = content.trim()

    if (!normalizedContent) {
      return null
    }

    try {
      sendingMessage.value = true
      messagesError.value = null

      const realtimeStore = useRealtimeStore()

      if (realtimeStore.isConnected) {
        const sent = await realtimeStore.sendMessage(chatId, normalizedContent)

        if (sent) {
          return true
        }

        const message = realtimeStore.connectionError ?? 'Unable to send message'

        messagesError.value = message
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

      messagesError.value = message
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

    return normalizedMessage
  }

  function receiveChatUpdate(chat: IChat) {
    const normalizedChat = normalizeChat(chat)
    const exists = chatList.value.some(item => item.id === normalizedChat.id)

    chatList.value = [
      normalizedChat,
      ...chatList.value.filter(item => item.id !== normalizedChat.id)
    ]

    if (!exists) {
      void useRealtimeStore().joinChat(normalizedChat.id)
    }

    return normalizedChat
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
      lastMessage,
      latestMessage: chat.latestMessage
        ? normalizeMessage(chat.latestMessage)
        : lastMessage
    }
  }

  function updateChatLastMessage(chatId: string, message: IMessage) {
    chatList.value = chatList.value.map(chat => {
      if (chat.id !== chatId) {
        return chat
      }

      return {
        ...chat,
        lastMessage: message,
        latestMessage: message,
        updatedAt: message.createdAt ?? message.timestamp
      }
    })
  }

  return {
    chatList,
    selectedChatId,
    messagesByChat,
    messagesLoading,
    messagesError,
    sendingMessage,
    creatingChat,
    getChat,
    currentMessages,
    setChat,
    selectChat,
    resetChatState,
    createChat,
    loadChats,
    loadMessages,
    receiveChatUpdate,
    receiveMessage,
    sendMessage
  }
}, {
  persist: true
})

export default useChatStore
