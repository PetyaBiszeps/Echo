<script setup lang="ts">
import ChatComponent from '@/components/layout/ChatComponent.vue'
import useChatStore from '@/stores/chats'
import {
  watch
} from 'vue'
import {
  useRoute,
  useRouter
} from 'vue-router'

// Init
const route = useRoute()
const router = useRouter()
const chatStore = useChatStore()

let routeRequestId = 0

// Methods
async function syncChatFromRoute(chatId: string | null) {
  const requestId = ++routeRequestId

  if (!chatId) {
    chatStore.clearSelectedChat()
    return
  }

  if (chatStore.chatList.length === 0) {
    await chatStore.loadChats()
  }

  if (requestId !== routeRequestId) {
    return
  }

  const chat = chatStore.chatList.find(item => item.id === chatId)

  if (!chat) {
    chatStore.clearSelectedChat()
    await router.replace({
      name: 'chat-empty'
    })
    return
  }

  if (chatStore.selectedChatId !== chatId) {
    chatStore.selectChat(chatId)
  }

  const loaded = await chatStore.loadMessages(chatId)

  if (!loaded) {
    chatStore.clearSelectedChat()
    await router.replace({
      name: 'chat-empty'
    })
  }
}

watch(() => route.params.chatId, (value) => {
  const chatId = Array.isArray(value) ? value[0] : value

  void syncChatFromRoute(chatId ?? null)
}, {
  immediate: true
})
</script>

<template>
  <main :class="['chatView']">
    <ChatComponent />
  </main>
</template>
