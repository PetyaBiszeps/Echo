<script setup lang="ts">
import type {
  IChat
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()
</script>

<template>
  <li :class="['sidebarChat']">
    <img
      src="@/assets/icons/avatar.svg"
      :alt="chat.title || ''"
    >

    <section>
      <h4>{{ chat.title }}</h4>

      <p>
        <span :class="['message']">{{ chat.lastMessage?.content }}</span>

        <span :class="['status']">{{ chat.unreadCount > 0 ? '✔✔' : '✔' }}</span>
      </p>
    </section>
  </li>
</template>