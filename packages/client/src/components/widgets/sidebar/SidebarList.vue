<script setup lang="ts">
import type { IUser } from '@/components/layout/sidebar/Sidebar.types'
import SidebarUser from '@/components/widgets/sidebar/SidebarUser.vue'
import { ref } from 'vue'

const members = ref<IUser[]>([
  { id: 0, name: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined }
])
</script>

<template>
  <ul :class="['sidebarList']">
    <SidebarUser
      v-for="member in members"
      :key="member.id"
      :user="member"
    />
  </ul>
</template>