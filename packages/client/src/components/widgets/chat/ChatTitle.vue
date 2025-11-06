<script setup lang="ts">
import type {
  IChat
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()
</script>

<template>
  <header :class="['chatTitle']">
    <h2>{{ chat.title }}</h2>
  </header>
</template>