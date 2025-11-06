<script setup lang="ts">
import type {
  IChat,
  IMessage
} from '@echo/shared'

const { messages } = defineProps<{
  chat: IChat
  messages: IMessage[]
}>()
</script>

<template>
  <li
    v-for="message in messages"
    :key="message.id"

    :class="['chatMessage', {
      interlocutor: message.senderId === chat.participants[1].id
    }]"
  >
    <p>{{ message.content }}</p>
  </li>
</template>