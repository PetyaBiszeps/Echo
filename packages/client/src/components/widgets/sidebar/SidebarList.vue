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
  return chatStore.chatList
})

const filteredChats = computed(() => {
  const query = search.toString().toLowerCase().trim()

  const matched = chats.value.filter((chat) => {
    if (!query) {
      return true
    } else {
      const title = chat.name ?? chat.title ?? chat.participants[1]?.username ?? ''

      return title.toLowerCase().includes(query)
    }
  })

  if (query) {
    matched.sort((a, b) => {
      const aTitle = a.name ?? a.title ?? a.participants[1]?.username ?? ''
      const bTitle = b.name ?? b.title ?? b.participants[1]?.username ?? ''
      const compare = aTitle.localeCompare(bTitle, undefined, {
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
function chooseChat(chatId: string) {
  chatStore.selectChat(chatId)
}

onBeforeMount(() => {
  chatStore.loadChats()
})
</script>

<template>
  <ul :class="['sidebarList']">
    <SidebarChat
      v-for="chat in filteredChats"
      :key="chat.id"
      :chat="chat"

      :class="[{
        active: chatStore.selectedChatId === chat.id
      }]"

      @click="chooseChat(chat.id)"
    />
  </ul>
</template>
