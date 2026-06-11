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

  if (isStaleRequest(requestId)) {
    return
  }

  const chat = chatStore.chatList.find(item => item.id === chatId)

  if (isStaleRequest(requestId)) {
    return
  }

  if (!chat) {
    if (isStaleRequest(requestId)) {
      return
    }

    chatStore.clearSelectedChat()
    await router.replace({
      name: 'chat-empty'
    })
    return
  }

  if (chatStore.selectedChatId !== chatId) {
    chatStore.selectChat(chatId)
  }

  if (isStaleRequest(requestId)) {
    return
  }

  const loaded = await chatStore.loadMessages(chatId)

  if (isStaleRequest(requestId)) {
    return
  }

  if (!loaded) {
    if (isStaleRequest(requestId)) {
      return
    }

    chatStore.clearSelectedChat()
    await router.replace({
      name: 'chat-empty'
    })
    return
  }

  if (isStaleRequest(requestId) || chatStore.selectedChatId !== chatId) {
    return
  }

  await chatStore.markChatRead(chatId)
}

function isStaleRequest(requestId: number) {
  return requestId !== routeRequestId
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
