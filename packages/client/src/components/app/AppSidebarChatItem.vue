<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  title: string
  lastMessage: string
  time: string
  unreadCount?: number
  active?: boolean
  isOnline?: boolean
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()

const initials = computed(() => props.title
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join(''))
</script>

<template>
  <button
    type="button"
    :aria-pressed="active ? 'true' : 'false'"
    :data-active="active ? 'true' : 'false'"
    :class="cn(
      'group flex h-18 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left transition-colors',
      'cursor-pointer hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none',
      active && 'border border-sidebar-border bg-sidebar-accent text-sidebar-accent-foreground',
    )"
    @click="$emit('click', $event)"
  >
    <span class="relative shrink-0">
      <span class="grid size-11 place-items-center rounded-full border border-sidebar-primary/35 bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
        {{ initials }}
      </span>

      <span
        v-if="isOnline"
        class="absolute right-0 bottom-0 size-3 rounded-full border-2 border-sidebar bg-green-500 group-data-[active=true]:border-sidebar-accent"
        aria-label="Online"
      />
    </span>

    <span class="flex min-w-0 flex-1 flex-col gap-1">
      <span class="flex min-w-0 items-center gap-2">
        <span class="min-w-0 flex-1 truncate text-sm font-bold text-sidebar-foreground">
          {{ title }}
        </span>

        <span class="shrink-0 text-[10px] font-medium text-sidebar-foreground/60">
          {{ time }}
        </span>
      </span>

      <span class="flex min-w-0 items-center gap-2">
        <span class="min-w-0 flex-1 truncate text-xs font-medium text-sidebar-foreground/62">
          {{ lastMessage }}
        </span>

        <span
          v-if="unreadCount"
          class="grid min-w-5 shrink-0 place-items-center rounded-full bg-sidebar-primary px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-sidebar-primary-foreground"
        >
          {{ unreadCount }}
        </span>
      </span>
    </span>
  </button>
</template>
