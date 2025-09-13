<script setup lang="ts">
const { name, type, size, variant, disabled } = withDefaults(defineProps<{
  name: string
  type?: 'button' | 'submit' | 'reset'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default'
  disabled?: boolean
}>(), {
  type: 'button',
  size: 'sm',
  variant: 'default',
  disabled: false
})
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

<style scoped lang="scss">
button {
  border: 1px solid transparent;

  span {
    font-weight: bold;
  }

  &[data-size='sm'] {
    padding: 0.3rem;
  }

  &[data-size='md'] {
    padding: 0.5rem;
  }

  &[data-size='lg'] {
    padding: 0.8rem;
  }

  &[data-variant='default'] {
    // background
    border-radius: 0.5rem;
  }
}
</style>