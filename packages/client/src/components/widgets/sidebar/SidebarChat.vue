<script setup lang="ts">
import UserAvatar from '@/components/ui/UserAvatar.vue'
import useAuthStore from '@/stores/auth'
import useRealtimeStore from '@/stores/realtime'
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
const realtimeStore = useRealtimeStore()

// Constants
const chatName = computed(() => chat.name ?? chat.title ?? chat.participants[1]?.username ?? 'Chat')
const latestMessage = computed(() => chat.latestMessage ?? chat.lastMessage ?? null)
const directChatParticipant = computed(() => {
  const currentUserId = authStore.user?.id

  if (chat.participants.length !== 2 || !currentUserId) {
    return null
  }

  return chat.participants.find(participant => participant.id !== currentUserId) ?? null
})
const avatarUser = computed(() => directChatParticipant.value ?? chat.participants[0] ?? null)
const isParticipantOnline = computed(() => {
  const participant = directChatParticipant.value

  return participant
    ? realtimeStore.isUserOnline(participant.id)
    : false
})
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
    <UserAvatar
      :class="['sidebarChatAvatar']"
      :username="avatarUser?.username ?? chatName"
      :avatar="avatarUser?.avatar ?? null"
      :size="'lg'"
      :show-presence="Boolean(directChatParticipant)"
      :is-online="isParticipantOnline"
    />

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
