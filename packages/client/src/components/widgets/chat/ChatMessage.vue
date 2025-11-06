<script setup lang="ts">
import type {
  IMessage
} from '@echo/shared'

const { messages } = defineProps<{
  messages: IMessage[]
}>()
</script>

<template>
  <li
    v-for="message in messages"
    :key="message.id"

    :class="['chatMessage']"
  >
    <p>{{ message.content }}</p>
  </li>
</template>