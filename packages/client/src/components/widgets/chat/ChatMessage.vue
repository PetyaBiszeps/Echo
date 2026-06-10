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

function isGroupedMessage(message: IMessage, index: number) {
  return messages[index - 1]?.senderId === message.senderId
}

function formatMessageTime(message: IMessage) {
  const date = new Date(message.timestamp ?? message.createdAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <li
    v-for="(message, index) in messages"
    :key="message.id"

    :class="['chatMessage', {
      own: isOwnMessage(message),
      grouped: isGroupedMessage(message, index)
    }]"
  >
    <p>{{ message.content }}</p>

    <time :datetime="message.timestamp ?? message.createdAt">
      {{ formatMessageTime(message) }}
    </time>
  </li>
</template>
