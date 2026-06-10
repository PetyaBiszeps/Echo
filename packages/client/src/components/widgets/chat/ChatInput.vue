<script setup lang="ts">
import BaseInput from '@/components/ui/base/BaseInput.vue'
import useChatStore from '@/stores/chats'

const { chatId, id, name, type, size, placeholder, disabled = false } = defineProps<{
  chatId: string
  id: string
  name: string
  type: string
  size: string
  placeholder: string
  disabled?: boolean
}>()

// Init
const chatStore = useChatStore()

// Constants
const model = defineModel<string | number>({
  required: true
})

// Methods
async function sendMessage() {
  const content = model.value.toString().trim()

  if (!content || disabled) {
    return
  }

  const message = await chatStore.sendMessage(chatId, content)

  if (message) {
    model.value = ''
  }
}
</script>

<template>
  <div :class="['chatInput']">
    <BaseInput
      v-model="model"

      :id="id"
      :name="name"
      :type="type"
      :size="size"
      :placeholder="placeholder"
      :disabled="disabled || chatStore.sendingMessage"

      @keyup.enter="sendMessage"
    />
  </div>
</template>
