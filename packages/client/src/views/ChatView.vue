<script setup lang="ts">
import ChatComponent from '@/components/layout/ChatComponent.vue'
import useChatStore from '@/stores/chats'
import {
  computed
} from 'vue'

  // Init
const chatStore = useChatStore()

  // Constants
const selectedChat = computed(() => chatStore.getChat)
</script>

<template>
  <main :class="['chatView']">
    <template v-if="selectedChat">
      <ChatComponent />
    </template>

    <template v-else>
      <p>Chat not selected yet :(</p>
    </template>
  </main>
</template>