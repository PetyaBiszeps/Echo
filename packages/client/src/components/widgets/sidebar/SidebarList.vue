<script setup lang="ts">
import type { IUser } from '@/components/layout/sidebar/Sidebar.types'
import SidebarUser from '@/components/widgets/sidebar/SidebarUser.vue'
import { ref, computed } from 'vue'

const { search } = defineProps<{
  search: string | number
}>()

const members = ref<IUser[]>([
  { id: 0, name: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined },
  { id: 1, name: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined },
  { id: 2, name: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined },
  { id: 3, name: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined },
  { id: 4, name: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined },
  { id: 5, name: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined },
  { id: 6, name: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined },
  { id: 7, name: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined },
  { id: 8, name: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined },
  { id: 9, name: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined },
  { id: 10, name: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined },
  { id: 11, name: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined },
  { id: 12, name: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined },
  { id: 13, name: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined },
  { id: 14, name: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined },
  { id: 15, name: 'Ya', avatar: undefined, lastMessage: 'Hello :)', isRead: false, timestamp: undefined },
  { id: 16, name: 'Mykyta', avatar: undefined, lastMessage: 'Lets go!', isRead: true, timestamp: undefined },
  { id: 17, name: 'Vlad', avatar: undefined, lastMessage: 'Dunno brutha', isRead: false, timestamp: undefined },
  { id: 18, name: 'Egor', avatar: undefined, lastMessage: 'Makes sense', isRead: false, timestamp: undefined },
  { id: 19, name: 'Egor', avatar: undefined, lastMessage: 'Will you make any changes soon? I have to know', isRead: false, timestamp: undefined }
])

const filteredMembers = computed(() => {
  const query = search.toString().toLowerCase().trim()

  const matched = members.value.filter((member) => {
    if (!query) {
      return true
    } else {
      return member.name.toLowerCase().includes(query)
    }
  })

  if (query) {
    matched.sort((a, b) => {
      const compare = a.name.localeCompare(b.name, undefined, {
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