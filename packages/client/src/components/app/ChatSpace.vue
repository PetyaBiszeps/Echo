<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import useChatStore from '@/store/chats.ts'
import ChatHeader from '@/components/app/ChatHeader.vue'
import EmptyChatState from '@/components/app/EmptyChatState.vue'
import MessageComposer from '@/components/app/MessageComposer.vue'
import MessageList from '@/components/app/MessageList.vue'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const auth = useAuthStore()
const chatStore = useChatStore()
const composerClearKey = ref(0)

const selectedChatId = computed(() => getRouteChatId(route.params.chatId))
const selectedChat = computed(() => chatStore.chats.find(chat => chat.id === selectedChatId.value) ?? null)
const selectedMessages = computed(() => selectedChatId.value
  ? chatStore.messagesByChatId[selectedChatId.value] ?? []
  : [])
const isLoadingMessages = computed(() => selectedChatId.value
  ? Boolean(chatStore.loadingMessagesByChatId[selectedChatId.value])
  : false)
const messageError = computed(() => selectedChatId.value
  ? chatStore.messageErrorsByChatId[selectedChatId.value] ?? null
  : null)
const isSendingMessage = computed(() => selectedChatId.value
  ? Boolean(chatStore.sendingByChatId[selectedChatId.value])
  : false)
const sendError = computed(() => selectedChatId.value
  ? chatStore.sendErrorsByChatId[selectedChatId.value] ?? null
  : null)
const typingUserIds = computed(() => selectedChatId.value
  ? chatStore.getTypingUserIds(selectedChatId.value, auth.user?.id)
  : [])
const typingLabel = computed(() => {
  const typingUserId = typingUserIds.value[0]

  if (!typingUserId) {
    return null
  }

  const participant = selectedChat.value?.participants.find(item => item.id === typingUserId)

  return participant?.username
    ? `${participant.username} is typing...`
    : 'Someone is typing...'
})

watch(selectedChatId, (chatId) => {
  if (chatId) {
    void loadMessages(chatId)
  }
}, {
  immediate: true
})

function getRouteChatId(value: unknown) {
  return Array.isArray(value)
    ? value[0] ?? null
    : typeof value === 'string'
      ? value
      : null
}

async function loadMessages(chatId: string, force = false) {
  const loaded = await chatStore.fetchMessages(chatId, {
    force
  })

  if (loaded && selectedChatId.value === chatId) {
    void chatStore.markChatRead(chatId)
  }
}

function retryMessages() {
  if (!selectedChatId.value) {
    return
  }

  void loadMessages(selectedChatId.value, true)
}

async function sendMessage(content: string) {
  if (!selectedChatId.value) {
    return
  }

  const message = await chatStore.sendMessage(selectedChatId.value, content)

  if (message) {
    composerClearKey.value += 1
  }
}
</script>

<template>
  <section class="relative flex h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
    <div class="pointer-events-none absolute -top-20 right-[11%] size-[min(30vw,27rem)] rounded-full border border-primary/[0.04] bg-primary/[0.025]" />
    <div class="pointer-events-none absolute top-[31%] right-[23%] size-[min(14vw,12.5rem)] rounded-full border border-primary/[0.04] bg-primary/[0.02]" />
    <div class="pointer-events-none absolute right-[5%] bottom-[8%] size-[min(20vw,16.25rem)] rounded-full border border-primary/[0.04] bg-primary/[0.02]" />

    <EmptyChatState v-if="!selectedChatId" />

    <div
      v-else
      class="relative z-10 flex h-full min-h-0 w-full flex-col overflow-hidden"
    >
      <ChatHeader
        :chat="selectedChat"
        :typing-label="typingLabel"
      />

      <main
        v-if="isLoadingMessages"
        class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-11 py-7"
      >
        <div
          v-for="item in 4"
          :key="item"
          :class="[
            'h-15 max-w-[min(34rem,78%)] animate-pulse rounded-2xl bg-card/80',
            item % 2 === 0 ? 'ml-auto w-2/5' : 'mr-auto w-3/5',
          ]"
          aria-hidden="true"
        />
      </main>

      <main
        v-else-if="messageError"
        class="grid min-h-0 flex-1 place-items-center overflow-hidden px-7 py-7"
      >
        <div class="max-w-sm rounded-2xl border border-border/70 bg-card/80 px-5 py-4 text-center shadow-sm">
          <p class="text-sm font-bold text-card-foreground">
            {{ messageError }}
          </p>

          <button
            type="button"
            class="mt-3 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            @click="retryMessages"
          >
            Retry
          </button>
        </div>
      </main>

      <MessageList
        v-else
        :messages="selectedMessages"
      />

      <p
        v-if="sendError"
        class="shrink-0 px-7 pb-2 text-xs font-medium text-destructive"
      >
        {{ sendError }}
      </p>

      <MessageComposer
        :chat-id="selectedChatId"
        :disabled="!selectedChatId"
        :is-sending="isSendingMessage"
        :clear-key="composerClearKey"
        @send-message="sendMessage"
      />
    </div>
  </section>
</template>
