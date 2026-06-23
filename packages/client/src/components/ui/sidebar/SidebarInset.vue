<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <main :class="cn('relative flex h-svh min-h-0 flex-1 flex-col overflow-hidden bg-background', props.class)">
    <slot />
  </main>
</template>
