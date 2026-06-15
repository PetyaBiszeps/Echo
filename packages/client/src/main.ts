import { createApp } from 'vue'
import plugin from '@/plugins'
import router from '@/router'
import store from '@/stores'
import useRealtimeStore from '@/stores/realtime'
import useChatStore from '@/stores/chats'
import useAuthStore from '@/stores/auth'
import useToastStore from '@/stores/toast'
import {
  watch
} from 'vue'
import type {
  IChat,
  IMessage
} from '@echo/shared'
import App from '@/App.vue'
import '@/styles/main.scss'

const app = createApp(App)

app.use(store)

app.use(router)

const authStore = useAuthStore()
const chatStore = useChatStore()
const realtimeStore = useRealtimeStore()
const toastStore = useToastStore()

realtimeStore.setMessageHandler((message) => {
  const selectedChatId = chatStore.selectedChatId
  const currentUserId = authStore.user?.id

  chatStore.receiveMessage(message)

  if (!shouldShowMessageToast(message, selectedChatId, currentUserId)) {
    return
  }

  showMessageToast(message)
})
realtimeStore.setChatUpdatedHandler(chatStore.receiveChatUpdate)
realtimeStore.setChatReadHandler((payload) => {
  chatStore.receiveChatRead(payload, authStore.user?.id)
})
realtimeStore.setAuthErrorHandler(() => {
  authStore.logout(false)
})

if (authStore.token?.accessToken) {
  realtimeStore.connect(authStore.token.accessToken)
}

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    void router.replace({
      name: 'auth'
    })
  }
})

app
  .use(plugin)
  .mount('#app')

function shouldShowMessageToast(message: IMessage, selectedChatId: string | null, currentUserId: string | undefined) {
  return Boolean(message.chatId)
    && message.senderId !== currentUserId
    && message.chatId !== selectedChatId
}

function showMessageToast(message: IMessage) {
  const chat = getMessageChat(message)
  const chatId = message.chatId

  if (!chatId) {
    return
  }

  toastStore.addToaster({
    type: 'neutral',
    title: getMessageToastTitle(message, chat),
    message: getMessagePreview(message.content),
    onClick: () => {
      void router.push({
        name: 'chat',
        params: {
          chatId
        }
      })
    }
  })
}

function getMessageChat(message: IMessage) {
  return chatStore.chatList.find(chat => chat.id === message.chatId) ?? null
}

function getMessageToastTitle(message: IMessage, chat: IChat | null) {
  const sender = chat?.participants.find(participant => participant.id === message.senderId)

  return sender?.username
    ?? chat?.name
    ?? chat?.title
    ?? 'New message'
}

function getMessagePreview(content: string) {
  const preview = content.trim().replace(/\s+/g, ' ')

  if (preview.length <= 90) {
    return preview
  }

  return `${preview.slice(0, 87)}...`
}
