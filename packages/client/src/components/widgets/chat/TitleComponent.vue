<script setup lang="ts">
import type {
  IChat
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()
</script>

<template>
  <header :class="['title']">
    <h1>{{ chat.title }}</h1>
  </header>
</template>