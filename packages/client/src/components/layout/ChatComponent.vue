<script setup lang="ts">
import MessageComponent from '@/components/widgets/chat/MessageComponent.vue'
import useChatStore from '@/stores/chats'
import { ref, computed } from 'vue'
import type {
  IMessage
} from '@echo/shared'

  // Init
const chatStore = useChatStore()

  // Constants
const message = ref('')
const chat = computed(() => chatStore.getChat)
</script>

<template>
  <MessageComponent />
</template>