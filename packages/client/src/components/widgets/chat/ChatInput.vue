<script setup lang="ts">
import BaseInput from '@/components/ui/base/BaseInput.vue'

const { id, name, type, size, placeholder } = defineProps<{
  id: string
  name: string
  type: string
  size: string
  placeholder: string
}>()

  // Constants
const model = defineModel<string | number>({
  required: true
})
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
    />
  </div>
</template>