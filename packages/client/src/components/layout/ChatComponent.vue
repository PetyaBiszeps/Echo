<script setup lang="ts">
import MessageComponent from '@/components/widgets/chat/MessageComponent.vue'
import useChatStore from '@/stores/chats'
import { computed } from 'vue'
import type {
  IChat,
  IMessage
} from '@echo/shared'

  // Init
const chatStore = useChatStore()

  // Constants
const chat = computed<IChat | null>(() => chatStore.getChat)

const messages = computed<IMessage[]>(() => {
  if (!chat.value) {
    return []
  }

  return [{
    id: 'm1',
    content: `Hello from ${chat.value.title ?? 'Unnamed chat'}`,
    senderId: chat.value.participants[0].id,
    timestamp: new Date().toISOString()
  }, {
      id: 'm2',
      content: 'This is a test message',
      senderId: chat.value.participants[1]?.id ?? 'unknown',
      timestamp: new Date().toISOString()
  }]
})
</script>

<template>
  <main :class="['chat']">
    <template v-if="chat">
      <MessageComponent :messages="messages" />
    </template>

    <template v-else>
      <p>No chat selected yet...</p>
    </template>
  </main>
</template>