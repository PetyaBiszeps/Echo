<script setup lang="ts">
import type {
  IChat
} from '@echo/shared'

const { chat, typingText = null, presenceText = null } = defineProps<{
  chat: IChat
  typingText?: string | null
  presenceText?: string | null
}>()
</script>

<template>
  <header :class="['chatTitle']">
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
  </header>
</template>
