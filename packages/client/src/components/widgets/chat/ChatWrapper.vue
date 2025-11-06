<script setup lang="ts">
import ChatMessage from '@/components/widgets/chat/ChatMessage.vue'
import { computed } from 'vue'
import type {
  IChat,
  IMessage
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()

  // Constants
const messages = computed<IMessage[]>(() => {
  if (!chat) {
    return []
  }

  return [{
    id: 'm1',
    content: `Hello from ${chat.title ?? 'Unnamed chat'}`,
    senderId: chat.participants[0].id,
    timestamp: new Date().toISOString()
  }, {
    id: 'm2',
    content: 'This is a test message',
    senderId: chat.participants[1]?.id ?? 'unknown',
    timestamp: new Date().toISOString()
  }]
})
</script>

<template>
  <ul :class="['chatWrapper']">
    <ChatMessage :messages="messages" />
  </ul>
</template>