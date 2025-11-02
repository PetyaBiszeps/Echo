<script setup lang="ts">
import SidebarUser from '@/components/widgets/sidebar/SidebarUser.vue'
import useChatStore from '@/stores/chats'
import {
  computed,
  onBeforeMount
} from 'vue'

const { search } = defineProps<{
  search: string | number
}>()

  // Init
const chats = useChatStore()

const members = computed(() => {
  return chats.chatList.map(chat => {
    const lastMessage = chat.lastMessage

    return {
      id: chat.id,
      title: chat.title,
      avatar: chat.participants[0]?.avatar,
      lastMessage: lastMessage?.content ?? '',
      isRead: chat.unreadCount === 0,
      timeStamp: lastMessage?.timestamp,
      unreadCount: chat.unreadCount ?? 0
    }
  })
})

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

onBeforeMount(() => {
  chats.loadChats()
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