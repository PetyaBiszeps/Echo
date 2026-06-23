import {
  computed,
  onUnmounted,
  watch
} from 'vue'
import { useRoute } from 'vue-router'
import useAuthStore from '@/store/auth.ts'
import useChatStore from '@/store/chats.ts'
import {
  connectChatSocket,
  disconnectChatSocket,
  joinChatRoom
} from '@/services/chatSocket.ts'

export default function useChatRealtime() {
  const auth = useAuthStore()
  const chatStore = useChatStore()
  const route = useRoute()
  const accessToken = computed(() => auth.token?.accessToken ?? '')
  const selectedChatId = computed(() => getRouteChatId(route.params.chatId))

  const stop = watch(accessToken, (token) => {
    if (!token) {
      disconnectChatSocket()
      chatStore.clearAllTyping()
      return
    }

    connectChatSocket(token, {
      onMessageNew: (message) => {
        const chatId = message.chatId

        chatStore.applyMessage(message)

        if (chatId && chatId === selectedChatId.value && message.senderId !== auth.user?.id) {
          void chatStore.markChatRead(chatId, {
            force: true
          })
        }
      },
      onChatUpdated: (chat) => {
        chatStore.upsertChat(chat)
        joinChatRoom(chat.id)
      },
      onTypingUpdate: (payload) => {
        if (payload.userId === auth.user?.id) {
          return
        }

        chatStore.setUserTyping(payload.chatId, payload.userId, payload.isTyping)
      }
    })
  }, {
    immediate: true
  })

  onUnmounted(() => {
    stop()
    disconnectChatSocket()
    chatStore.clearAllTyping()
  })
}

function getRouteChatId(value: unknown) {
  return Array.isArray(value)
    ? value[0] ?? null
    : typeof value === 'string'
      ? value
      : null
}
