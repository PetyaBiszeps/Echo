<script setup lang="ts">
import useChatStore from '@/stores/chats'
import {
  nextTick,
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

// Constants
const textarea = ref<HTMLTextAreaElement | null>(null)
const model = defineModel<string | number>({
  required: true
})

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

async function sendMessage() {
  const content = model.value.toString().trim()

  if (!content || props.disabled || chatStore.sendingMessage) {
    return
  }

  const message = await chatStore.sendMessage(props.chatId, content)

  if (message) {
    model.value = ''
    await nextTick()
    resizeTextarea()
    focusInput()
  }
}

watch(() => model.value, () => {
  void nextTick(resizeTextarea)
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

      @input="resizeTextarea"
      @keydown="handleKeydown"
    />
  </div>
</template>
