<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import type {
  IChat
} from '@/types'

const {
  chatId = null
} = defineProps<IChat>()

  // Init
const route = useRoute()

const selectedChat = computed(() => {
  return chatId || route.params.chatId as string || null
})
</script>

<template>
  <main :class="['chatView']">
    <template v-if="selectedChat">
      <p>Chat selected!</p>
    </template>

    <template v-else>
      <p>Chat not selected yet :(</p>
    </template>
  </main>
</template>