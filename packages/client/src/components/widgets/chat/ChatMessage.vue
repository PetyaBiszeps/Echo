<script setup lang="ts">
import useAuthStore from '@/stores/auth'
import type {
  IMessage
} from '@echo/shared'

const { messages, showReadReceipts = false } = defineProps<{
  messages: IMessage[]
  showReadReceipts?: boolean
}>()

// Init
const authStore = useAuthStore()

// Methods
function isOwnMessage(message: IMessage) {
  return message.senderId === authStore.user?.id
}

function showReadReceipt(message: IMessage) {
  return showReadReceipts && isOwnMessage(message)
}

function getReadReceiptLabel(message: IMessage) {
  return message.isReadByPeer ? 'Read' : 'Sent'
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

    <footer>
      <time :datetime="message.timestamp ?? message.createdAt">
        {{ formatMessageTime(message) }}
      </time>

      <span
        v-if="showReadReceipt(message)"
        :class="['readReceipt', {
          read: message.isReadByPeer
        }]"
        :aria-label="getReadReceiptLabel(message)"
      >
        <span aria-hidden="true">&#10003;</span>
        <span
          v-if="message.isReadByPeer"
          aria-hidden="true"
        >&#10003;</span>
      </span>
    </footer>
  </li>
</template>
