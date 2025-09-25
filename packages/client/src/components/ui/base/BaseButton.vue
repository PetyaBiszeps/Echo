<script setup lang="ts">
const {
  name,
  type = 'button',
  size = 'sm',
  variant = 'default',
  disabled = false
} = defineProps<{
  name: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type"
    :data-size="size"
    :data-variant="variant"
    :disabled="disabled"
  >
    <span>{{ name }}</span>
  </button>
</template>