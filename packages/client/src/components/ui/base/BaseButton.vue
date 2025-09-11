<script setup lang="ts">
const { name, type, disabled } = defineProps<{
  name: string
  type: 'button' | 'submit' | 'reset'
  disabled: boolean
}>()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
  >
    <span>{{ name }}</span>
  </button>
</template>