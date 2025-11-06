<script setup lang="ts">
import ChatWrapper from '@/components/widgets/chat/ChatWrapper.vue'
import ChatTitle from '@/components/widgets/chat/ChatTitle.vue'
import useChatStore from '@/stores/chats'
import { computed } from 'vue'
import type {
  IChat
} from '@echo/shared'

  // Init
const chatStore = useChatStore()

  // Constants
const chat = computed<IChat | null>(() => chatStore.getChat)
</script>

<template>
  <main :class="['chat']">
    <template v-if="chat">
      <ChatTitle :chat="chat" />

      <ChatWrapper :chat="chat" />
    </template>

    <template v-else>
      <p>No chat selected yet...</p>
    </template>
  </main>
</template>