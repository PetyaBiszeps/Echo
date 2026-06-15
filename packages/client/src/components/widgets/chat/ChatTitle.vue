<script setup lang="ts">
import UserAvatar from '@/components/ui/UserAvatar.vue'
import type {
  IChat,
  IUser
} from '@echo/shared'

const { chat, participant = null, typingText = null, presenceText = null, isOnline = false } = defineProps<{
  chat: IChat
  participant?: IUser | null
  typingText?: string | null
  presenceText?: string | null
  isOnline?: boolean
}>()
</script>

<template>
  <header :class="['chatTitle']">
    <UserAvatar
      v-if="participant"
      :class="['chatTitleAvatar']"
      :username="participant.username"
      :avatar="participant.avatar ?? null"
      :size="'md'"
      :show-presence="true"
      :is-online="isOnline"
    />

    <section :class="['chatTitleText']">
      <h2>{{ chat.name ?? chat.title }}</h2>

      <p
        v-if="typingText"
        :class="['chatTitleTyping']"
      >
        {{ typingText }}
      </p>

      <p
        v-else-if="presenceText"
        :class="['chatTitlePresence']"
      >
        {{ presenceText }}
      </p>
    </section>
  </header>
</template>
