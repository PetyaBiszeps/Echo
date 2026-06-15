<script setup lang="ts">
import ChatMessage from '@/components/widgets/chat/ChatMessage.vue'
import useChatStore from '@/stores/chats'
import useAuthStore from '@/stores/auth'
import {
  computed,
  nextTick,
  onMounted,
  ref,
  watch
} from 'vue'
import type {
  IChat
} from '@echo/shared'

const { chat } = defineProps<{
  chat: IChat
}>()

// Init
const chatStore = useChatStore()
const authStore = useAuthStore()

// Constants
const wrapper = ref<HTMLElement | null>(null)
const messages = computed(() => chatStore.currentMessages)

// Methods
function isNearBottom() {
  const element = wrapper.value

  if (!element) {
    return true
  }

  return element.scrollHeight - element.scrollTop - element.clientHeight < 80
}

async function scrollToBottom() {
  await nextTick()

  const element = wrapper.value

  if (element) {
    element.scrollTop = element.scrollHeight
  }
}

watch(() => chat.id, () => {
  void scrollToBottom()
})

watch(() => messages.value.at(-1)?.id, (_id, oldId) => {
  const latestMessage = messages.value.at(-1)

  if (!latestMessage || !oldId) {
    void scrollToBottom()
    return
  }

  const shouldScroll = latestMessage.senderId === authStore.user?.id || isNearBottom()

  if (shouldScroll) {
    void scrollToBottom()
  }
})

onMounted(() => {
  void scrollToBottom()
})
</script>

<template>
  <ul
    ref="wrapper"
    :class="['chatWrapper']"
  >
    <ChatMessage
      :messages="messages"
      :show-read-receipts="chat.participants.length === 2"
    />
  </ul>
</template>
