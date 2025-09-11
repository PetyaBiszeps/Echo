<script setup lang="ts">
const { id, name, type, placeholder, disabled, readonly, autocomplete } = defineProps<{
  id: string
  name: string
  type: string
  placeholder: string
  disabled: boolean
  readonly: boolean
  autocomplete: string
}>()
const emit = defineEmits(['focus', 'blur'])

  // Constants
const model = defineModel<string | number>({
  required: true
})
</script>

<template>
  <label :for="id">
    <input
      :id="id"
      v-model="model"
      :name="name"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"

      @focus="emit('focus')"
      @blur="emit('blur')"
    >
  </label>
</template>