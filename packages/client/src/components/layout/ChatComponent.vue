<script setup lang="ts">
import ChatWrapper from '@/components/widgets/chat/ChatWrapper.vue'
import ChatTitle from '@/components/widgets/chat/ChatTitle.vue'
import ChatInput from '@/components/widgets/chat/ChatInput.vue'
import BaseButton from '@/components/ui/base/BaseButton.vue'
import useAuthStore from '@/stores/auth'
import useChatStore from '@/stores/chats'
import useRealtimeStore from '@/stores/realtime'
import {
  computed,
  nextTick,
  ref,
  watch
} from 'vue'
import type {
  IChat
} from '@echo/shared'


// Init
const authStore = useAuthStore()
const chatStore = useChatStore()
const realtimeStore = useRealtimeStore()

// Constants
const msg = ref('')
const chatInput = ref<{ focusInput: () => void } | null>(null)
const chat = computed<IChat | null>(() => chatStore.getChat)
const inputDisabled = computed(() => chatStore.messagesLoading || chatStore.sendingMessage)
const realtimeStatus = computed(() => {
  if (realtimeStore.isConnected) {
    return null
  }

  return realtimeStore.connectionError
    ? 'Realtime unavailable'
    : 'Reconnecting...'
})
const inputPlaceholder = computed(() => {
  const chatName = chat.value?.name ?? chat.value?.title

  return chatName
    ? `Message ${chatName}`
    : 'Message'
})
const typingText = computed(() => {
  const activeChat = chat.value

  if (!activeChat) {
    return null
  }

  const currentUserId = authStore.user?.id
  const typingUserIds = realtimeStore
    .getTypingUserIds(activeChat.id)
    .filter(userId => userId !== currentUserId)

  if (typingUserIds.length === 0) {
    return null
  }

  const names = typingUserIds.map(userId => {
    return activeChat.participants.find(participant => participant.id === userId)?.username ?? 'Someone'
  })

  if (names.length === 1) {
    return `${names[0]} is typing...`
  }

  if (names.length === 2) {
    return `${names[0]} and ${names[1]} are typing...`
  }

  return `${names[0]} and ${names.length - 1} others are typing...`
})
const directChatParticipant = computed(() => {
  const activeChat = chat.value
  const currentUserId = authStore.user?.id

  if (!activeChat || activeChat.participants.length !== 2 || !currentUserId) {
    return null
  }

  return activeChat.participants.find(participant => participant.id !== currentUserId) ?? null
})
const presenceText = computed(() => {
  const participant = directChatParticipant.value

  if (!participant) {
    return null
  }

  return realtimeStore.isUserOnline(participant.id)
    ? 'Online'
    : formatPresenceText(realtimeStore.getLastSeenAt(participant.id) ?? participant.lastSeenAt ?? null)
})
const isDirectParticipantOnline = computed(() => {
  const participant = directChatParticipant.value

  return participant
    ? realtimeStore.isUserOnline(participant.id)
    : false
})

watch(() => [chatStore.selectedChatId, chatStore.messagesLoading] as const, ([chatId, loading]) => {
  if (!chatId || loading) {
    return
  }

  void focusMessageInput()
}, {
  immediate: true
})

async function focusMessageInput() {
  await nextTick()
  chatInput.value?.focusInput()
}

function retryLoadMessages() {
  if (chatStore.selectedChatId) {
    void chatStore.loadMessages(chatStore.selectedChatId).finally(() => {
      void focusMessageInput()
    })
  }
}

function formatPresenceText(lastSeenAt: string | null) {
  if (!lastSeenAt) {
    return 'Offline'
  }

  const date = new Date(lastSeenAt)

  if (Number.isNaN(date.getTime())) {
    return 'Offline'
  }

  if (isSameDay(date, new Date())) {
    return `last seen ${date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })}`
  }

  const yesterday = new Date()

  yesterday.setDate(yesterday.getDate() - 1)

  if (isSameDay(date, yesterday)) {
    return 'last seen yesterday'
  }

  return `last seen ${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}
</script>

<template>
  <main :class="['chat']">
    <template v-if="chat">
      <ChatTitle
        :chat="chat"
        :participant="directChatParticipant"
        :typing-text="typingText"
        :presence-text="presenceText"
        :is-online="isDirectParticipantOnline"
      />

      <p
        v-if="realtimeStatus"
        :class="['chatRealtimeStatus']"
      >
        {{ realtimeStatus }}
      </p>

      <section :class="['chatBody']">
        <div
          v-if="chatStore.messagesLoading"
          :class="['chatState']"
        >
          <p>Loading messages...</p>
        </div>

        <div
          v-else-if="chatStore.messagesError"
          :class="['chatState']"
        >
          <p>{{ chatStore.messagesError }}</p>

          <BaseButton
            :name="'Retry'"
            :type="'button'"
            @click="retryLoadMessages"
          />
        </div>

        <div
          v-else-if="chatStore.currentMessages.length === 0"
          :class="['chatState']"
        >
          <p>No messages yet. Say hi</p>
        </div>

        <ChatWrapper
          v-else
          :chat="chat"
        />
      </section>

      <p
        v-if="chatStore.sendingError"
        :class="['chatSendError']"
      >
        {{ chatStore.sendingError }}
      </p>

      <ChatInput
        v-model="msg"
        ref="chatInput"

        :id="'message'"
        :chat-id="chat.id"
        :name="'message'"
        :type="'text'"
        :size="'lg'"
        :placeholder="inputPlaceholder"
        :disabled="inputDisabled"
      />
    </template>

    <template v-else>
      <div :class="['chatState', 'empty']">
        <p>Select a chat or start a conversation</p>
      </div>
    </template>
  </main>
</template>
