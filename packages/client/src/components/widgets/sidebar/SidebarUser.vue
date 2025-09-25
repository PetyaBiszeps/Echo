<script setup lang="ts">
import type { IUser } from '@/components/layout/sidebar/Sidebar.types'

const { user } = defineProps<{
  user: IUser
}>()
</script>

<template>
  <li :class="['sidebarUser']">
    <img
      src="@/assets/icons/avatar.svg"
      :alt="user.name"
    >

    <section>
      <h4>{{ user.name }}</h4>

      <p>
        <span :class="['message']">{{ user.lastMessage }}</span>

        <span>{{ user.isRead ? '✔✔' : '✔' }}</span>
      </p>
    </section>
  </li>
</template>