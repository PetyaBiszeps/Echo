<script setup lang="ts">
const { name, type, disabled } = withDefaults(defineProps<{
  name: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  type: 'button',
  disabled: false
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
  >
    <span>{{ name }}</span>
  </button>
</template>