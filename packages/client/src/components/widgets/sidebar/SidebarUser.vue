<script setup lang="ts">
import type {
  IUser
} from '@/types'

const { user } = defineProps<{
  user: IUser
}>()
</script>

<template>
  <li :class="['sidebarUser']">
    <img
      src="@/assets/icons/avatar.svg"
      :alt="user.title"
    >

    <section>
      <h4>{{ user.title }}</h4>

      <p>
        <span :class="['message']">{{ user.lastMessage }}</span>

        <span :class="['status']">{{ user.isRead ? '✔✔' : '✔' }}</span>
      </p>
    </section>
  </li>
</template>