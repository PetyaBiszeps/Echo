<script setup lang="ts">
import useChatStore from '@/stores/chats'
import useRealtimeStore from '@/stores/realtime'
import {
  nextTick,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'

const props = withDefaults(defineProps<{
  chatId: string
  id: string
  name: string
  type?: string
  size: string
  placeholder: string
  disabled?: boolean
}>(), {
  disabled: false,
  type: 'text'
})

// Init
const chatStore = useChatStore()
const realtimeStore = useRealtimeStore()

// Constants
const STOP_TYPING_DELAY_MS = 2000
const textarea = ref<HTMLTextAreaElement | null>(null)
const model = defineModel<string | number>({
  required: true
})
let typingStopTimer: ReturnType<typeof setTimeout> | null = null
let activeTypingChatId: string | null = null

// Methods
function resizeTextarea() {
  const element = textarea.value

  if (!element) {
    return
  }

  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

function focusInput() {
  textarea.value?.focus({
    preventScroll: true
  })
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey) {
    return
  }

  event.preventDefault()
  void sendMessage()
}

function handleInput() {
  resizeTextarea()
  updateTypingState()
}

async function sendMessage() {
  const content = model.value.toString().trim()

  if (!content || props.disabled || chatStore.sendingMessage) {
    return
  }

  const message = await chatStore.sendMessage(props.chatId, content)

  if (message) {
    stopTypingNow(props.chatId)
    model.value = ''
    await nextTick()
    resizeTextarea()
    focusInput()
  }
}

function updateTypingState() {
  const content = model.value.toString().trim()

  if (!content || props.disabled) {
    stopTypingNow()
    return
  }

  startTyping()
  scheduleTypingStop()
}

function startTyping() {
  if (activeTypingChatId === props.chatId) {
    return
  }

  if (activeTypingChatId) {
    stopTypingNow(activeTypingChatId)
  }

  if (realtimeStore.startTyping(props.chatId)) {
    activeTypingChatId = props.chatId
  }
}

function scheduleTypingStop() {
  clearTypingStopTimer()

  typingStopTimer = setTimeout(() => {
    stopTypingNow()
  }, STOP_TYPING_DELAY_MS)
}

function stopTypingNow(chatId = activeTypingChatId) {
  clearTypingStopTimer()

  if (!chatId) {
    return
  }

  realtimeStore.stopTyping(chatId)

  if (activeTypingChatId === chatId) {
    activeTypingChatId = null
  }
}

function clearTypingStopTimer() {
  if (!typingStopTimer) {
    return
  }

  clearTimeout(typingStopTimer)
  typingStopTimer = null
}

watch(() => model.value, () => {
  void nextTick(resizeTextarea)

  if (!model.value.toString().trim()) {
    stopTypingNow()
  }
})

watch(() => props.chatId, (chatId, previousChatId) => {
  if (previousChatId) {
    stopTypingNow(previousChatId)
  }

  if (chatId && model.value.toString().trim()) {
    updateTypingState()
  }
})

watch(() => props.disabled, (disabled) => {
  if (disabled) {
    stopTypingNow()
  }
})

watch(() => realtimeStore.isConnected, (isConnected) => {
  if (!isConnected) {
    stopTypingNow()
    return
  }

  if (model.value.toString().trim() && !props.disabled) {
    updateTypingState()
  }
})

onBeforeUnmount(() => {
  stopTypingNow()
})

defineExpose({
  focusInput
})
</script>

<template>
  <div :class="['chatInput']">
    <textarea
      v-model="model"
      ref="textarea"

      :id="props.id"
      :name="props.name"
      :data-type="props.type"
      :data-size="props.size"
      :placeholder="props.placeholder"
      :disabled="props.disabled || chatStore.sendingMessage"
      :rows="1"

      @input="handleInput"
      @keydown="handleKeydown"
    />
  </div>
</template>
