<script setup lang="ts">
import type {
  IMessage
} from '@echo/shared'

const { messages } = defineProps<{
  messages: IMessage[]
}>()
</script>

<template>
  <div
    v-for="message in messages"
    :key="message.id"

    :class="['message']"
  >
    <h1>{{ message.content }}</h1>
  </div>
</template>