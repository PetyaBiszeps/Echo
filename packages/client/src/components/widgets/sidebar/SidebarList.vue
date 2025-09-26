<script setup lang="ts">
import SidebarUser from '@/components/widgets/sidebar/SidebarUser.vue'
import { ref, computed } from 'vue'
import type {
  IUser
} from '@/types'

const { search } = defineProps<{
  search: string | number
}>()

const members = ref<IUser[]>([
  { id: 0, title: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 1, title: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined, unreadCount: 0 },
  { id: 2, title: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 3, title: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 4, title: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 5, title: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 6, title: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined, unreadCount: 0 },
  { id: 7, title: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 8, title: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 9, title: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 10, title: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 11, title: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined, unreadCount: 0 },
  { id: 12, title: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 13, title: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 14, title: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 15, title: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 16, title: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined, unreadCount: 0 },
  { id: 17, title: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 18, title: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined, unreadCount: 0 },
  { id: 19, title: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined, unreadCount: 0 }
])

const filteredMembers = computed(() => {
  const query = search.toString().toLowerCase().trim()

  const matched = members.value.filter((member) => {
    if (!query) {
      return true
    } else {
      return member.title.toLowerCase().includes(query)
    }
  })

  if (query) {
    matched.sort((a, b) => {
      const compare = a.title.localeCompare(b.title, undefined, {
        sensitivity: 'base'
      })

      if (compare !== 0) {
        return compare
      } else {
        return a.id - b.id
      }
    })
  }

  return matched
})
</script>

<template>
  <ul :class="['sidebarList']">
    <SidebarUser
      v-for="member in filteredMembers"
      :key="member.id"
      :user="member"
    />
  </ul>
</template>