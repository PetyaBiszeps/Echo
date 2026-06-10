<script setup lang="ts">
import useAuthStore from '@/stores/auth'
import type {
  IMessage
} from '@echo/shared'

const { messages } = defineProps<{
  messages: IMessage[]
}>()

// Init
const authStore = useAuthStore()

// Methods
function isOwnMessage(message: IMessage) {
  return message.senderId === authStore.user?.id
}
</script>

<template>
  <li
    v-for="message in messages"
    :key="message.id"

    :class="['chatMessage', {
      own: isOwnMessage(message)
    }]"
  >
    <p>{{ message.content }}</p>
  </li>
</template>
