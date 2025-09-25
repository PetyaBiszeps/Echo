<script setup lang="ts">
import type { IUser } from '@/components/layout/sidebar/Sidebar.types'

const { user } = defineProps<{
  user: IUser
}>()
</script>

<template>
  <li :class="['sidebarUser']">
    {{ user.name }}
    {{ user.avatar }}
    {{ user.lastMessage }}
    {{ user.isRead }}
    {{ user.timestamp }}
  </li>
</template>