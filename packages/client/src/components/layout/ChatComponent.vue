<script setup lang="ts">
import ChatWrapper from '@/components/widgets/chat/ChatWrapper.vue'
import ChatTitle from '@/components/widgets/chat/ChatTitle.vue'
import ChatInput from '@/components/widgets/chat/ChatInput.vue'
import BaseButton from '@/components/ui/base/BaseButton.vue'
import useChatStore from '@/stores/chats'
import { ref, computed, watch } from 'vue'
import type {
  IChat
} from '@echo/shared'


// Init
const chatStore = useChatStore()

// Constants
const msg = ref<string | number>('')
const chat = computed<IChat | null>(() => chatStore.getChat)
const inputDisabled = computed(() => chatStore.messagesLoading || chatStore.sendingMessage)

watch(() => chatStore.selectedChatId, (chatId) => {
  if (chatId) {
    chatStore.loadMessages(chatId)
  }
}, {
  immediate: true
})

function retryLoadMessages() {
  if (chatStore.selectedChatId) {
    chatStore.loadMessages(chatStore.selectedChatId)
  }
}
</script>

<template>
  <main :class="['chat']">
    <template v-if="chat">
      <ChatTitle :chat="chat" />

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

        :id="'message'"
        :chat-id="chat.id"
        :name="'message'"
        :type="'text'"
        :size="'lg'"
        :placeholder="'Message'"
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
