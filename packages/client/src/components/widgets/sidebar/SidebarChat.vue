<script setup lang="ts">
import useAuthStore from '@/stores/auth'
import {
  computed
} from 'vue'
import type {
  IMessage,
  IChat
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()

// Init
const authStore = useAuthStore()

// Constants
const chatName = computed(() => chat.name ?? chat.title ?? chat.participants[1]?.username ?? 'Chat')
const latestMessage = computed(() => chat.latestMessage ?? chat.lastMessage ?? null)
const preview = computed(() => {
  const message = latestMessage.value

  if (!message) {
    return 'No messages yet'
  }

  const prefix = message.senderId === authStore.user?.id
    ? 'You: '
    : ''

  return `${prefix}${message.content}`
})
const activityTime = computed(() => formatActivityTime(latestMessage.value, chat.updatedAt))

// Methods
function formatActivityTime(message: IMessage | null, updatedAt: string) {
  const value = message?.timestamp ?? message?.createdAt ?? updatedAt
  const date = new Date(value)

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
  <li :class="['sidebarChat']">
    <img
      src="@/assets/icons/avatar.svg"
      :alt="chatName"
    >

    <section>
      <header>
        <h4>{{ chatName }}</h4>

        <time :datetime="latestMessage?.timestamp ?? latestMessage?.createdAt ?? chat.updatedAt">
          {{ activityTime }}
        </time>
      </header>

      <p>
        <span :class="['message']">{{ preview }}</span>

        <span
          v-if="chat.unreadCount > 0"
          :class="['unread']"
        >
          {{ chat.unreadCount }}
        </span>
      </p>
    </section>
  </li>
</template>
