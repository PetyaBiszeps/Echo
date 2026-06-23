<script setup lang="ts">
import { Plus, Send } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import {
  computed,
  onUnmounted,
  ref,
  watch
} from 'vue'
import {
  startTyping,
  stopTyping
} from '@/services/chatSocket.ts'

const props = withDefaults(defineProps<{
  chatId?: string | null
  disabled?: boolean
  isSending?: boolean
  clearKey?: number
}>(), {
  chatId: null,
  disabled: false,
  isSending: false,
  clearKey: 0
})

const emit = defineEmits<{
  'send-message': [content: string]
}>()

const TYPING_IDLE_MS = 1800

const content = ref('')
const normalizedContent = computed(() => content.value.trim())
const canSend = computed(() => Boolean(normalizedContent.value) && !props.disabled && !props.isSending)

let activeTypingChatId: string | null = null
let idleTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.clearKey, () => {
  content.value = ''
  stopCurrentTyping()
})

watch([
  normalizedContent,
  () => props.chatId,
  () => props.disabled,
  () => props.isSending
], ([value, chatId, disabled, isSending]) => {
  const normalizedChatId = typeof chatId === 'string'
    ? chatId.trim()
    : ''

  clearIdleTimer()

  if (!value || !normalizedChatId || disabled || isSending) {
    stopCurrentTyping()
    return
  }

  if (activeTypingChatId !== normalizedChatId) {
    stopCurrentTyping()
    startTyping(normalizedChatId)
    activeTypingChatId = normalizedChatId
  }

  idleTimer = setTimeout(() => {
    stopCurrentTyping()
  }, TYPING_IDLE_MS)
})

onUnmounted(() => {
  stopCurrentTyping()
})

function handleSubmit() {
  if (!canSend.value) {
    return
  }

  emit('send-message', normalizedContent.value)
}

function stopCurrentTyping() {
  clearIdleTimer()

  if (!activeTypingChatId) {
    return
  }

  stopTyping(activeTypingChatId)
  activeTypingChatId = null
}

function clearIdleTimer() {
  if (!idleTimer) {
    return
  }

  clearTimeout(idleTimer)
  idleTimer = null
}
</script>

<template>
  <footer class="shrink-0 px-7 pb-6">
    <form
      class="flex min-h-16 items-center gap-3 rounded-2xl border border-primary/45 bg-card/80 px-3 py-2 shadow-[0_0_42px_color-mix(in_srgb,var(--primary)_8%,transparent)]"
      @submit.prevent="handleSubmit"
    >
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        class="rounded-xl"
        disabled
        aria-label="Add attachment"
      >
        <Plus class="size-4" />
      </Button>

      <textarea
        v-model="content"
        id="message-content"
        name="message"
        rows="1"
        :disabled="disabled || isSending"
        aria-label="Message input"
        placeholder="Type a message"
        class="min-h-10 flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-60"
        @keydown.enter.exact.prevent="handleSubmit"
      />

      <Button
        type="submit"
        size="icon-sm"
        class="rounded-xl"
        :disabled="!canSend"
        aria-label="Send message"
      >
        <Send class="size-4" />
      </Button>
    </form>
  </footer>
</template>
