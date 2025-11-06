<script setup lang="ts">
import SidebarChat from '@/components/widgets/sidebar/SidebarChat.vue'
import useChatStore from '@/stores/chats'
import {
  computed,
  onBeforeMount
} from 'vue'

const { search } = defineProps<{
  search: string | number
}>()

  // Init
const chatStore = useChatStore()

  // Constants
const chats = computed(() => {
  return chatStore.chatList.map(chat => {
    return {
      id: chat.id,
      title: chat.title ?? chat.participants[1].username ?? '',
      participants: chat.participants,
      lastMessage: chat.lastMessage,
      unreadCount: chat.unreadCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt
    }
  })
})

const filteredChats = computed(() => {
  const query = search.toString().toLowerCase().trim()

  const matched = chats.value.filter((chat) => {
    if (!query) {
      return true
    } else {
      return chat.title.toLowerCase().includes(query)
    }
  })

  if (query) {
    matched.sort((a, b) => {
      const compare = (a.title ?? '').localeCompare(b.title ?? '', undefined, {
        sensitivity: 'base'
      })

      if (compare !== 0) {
        return compare
      } else {
        return a.id.localeCompare(b.id)
      }
    })
  }

  return matched
})

  // Methods
function chooseChat(index: number) {
  const selectedChat = filteredChats.value[index]

  if (!selectedChat) {
    return
  }
  chatStore.selectChat(selectedChat.id)
}

onBeforeMount(() => {
  chatStore.loadChats()
})
</script>

<template>
  <ul :class="['sidebarList']">
    <SidebarChat
      v-for="(chat, index) in filteredChats"
      :key="chat.id"
      :chat="chat"

      :class="[{
        active: chatStore.selectedChatId === chat.id
      }]"

      @click="chooseChat(index)"
    />
  </ul>
</template>