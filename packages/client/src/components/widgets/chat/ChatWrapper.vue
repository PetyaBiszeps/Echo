<script setup lang="ts">
import ChatMessage from '@/components/widgets/chat/ChatMessage.vue'
import useChatStore from '@/stores/chats'
import type {
  IChat
} from '@echo/shared'

defineProps<{
  chat: IChat
}>()

// Init
const chatStore = useChatStore()
</script>

<template>
  <ul :class="['chatWrapper']">
    <ChatMessage
      :messages="chatStore.currentMessages"
    />
  </ul>
</template>
