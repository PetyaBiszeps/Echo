<script setup lang="ts">
const { id, name, type, placeholder, size, variant, disabled, readonly, autocomplete } = withDefaults(defineProps<{
  id: string
  name: string
  type?: string
  placeholder: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default'
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
}>(), {
  type: 'text',
  size: 'sm',
  variant: 'default',
  disabled: false,
  readonly: false,
  autocomplete: 'off'
})
const emit = defineEmits(['focus', 'blur'])

  // Constants
const model = defineModel<string | number>({
  required: true
})
</script>

<template>
  <input
    v-model="model"

    :id="id"
    :name="name"
    :type="type"
    :placeholder="placeholder"
    :data-size="size"
    :data-variant="variant"
    :disabled="disabled"
    :readonly="readonly"
    :autocomplete="autocomplete"

    @focus="emit('focus')"
    @blur="emit('blur')"
  >
</template>