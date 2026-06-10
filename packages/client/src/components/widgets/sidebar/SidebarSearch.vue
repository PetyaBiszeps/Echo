<script setup lang="ts">
import BaseInput from '@/components/ui/base/BaseInput.vue'

const { id, name, type, placeholder } = defineProps<{
  id: string
  name: string
  type: string
  placeholder: string
}>()
const emit = defineEmits<{
  keydown: [event: KeyboardEvent]
}>()

// Constants
const model = defineModel<string | number>({
  required: true
})
</script>

<template>
  <div :class="['search']">
    <BaseInput
      v-model="model"

      :id="id"
      :name="name"
      :type="type"
      :placeholder="placeholder"

      @keydown="emit('keydown', $event)"
    />
  </div>
</template>
