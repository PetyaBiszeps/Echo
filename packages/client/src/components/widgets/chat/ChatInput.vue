<script setup lang="ts">
import BaseInput from '@/components/ui/base/BaseInput.vue'

const { id, name, type, placeholder } = defineProps<{
  id: string
  name: string
  type: string
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
      :placeholder="placeholder"
    />
  </div>
</template>