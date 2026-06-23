<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import { MoreHorizontal, Phone, Video } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { computed } from 'vue'
import type { IChat } from '@echo/shared'

const props = defineProps<{
  chat?: IChat | null
  typingLabel?: string | null
}>()

const auth = useAuthStore()

const title = computed(() => props.chat?.name
  || props.chat?.title
  || props.chat?.participants.find(participant => participant.id !== auth.user?.id)?.username
  || 'Selected chat')

const status = computed(() => {
  if (props.typingLabel) {
    return props.typingLabel
  }

  const peer = props.chat?.participants.find(participant => participant.id !== auth.user?.id)

  if (!peer?.lastSeenAt) {
    return 'Conversation'
  }

  return `Last seen ${formatStatusTime(peer.lastSeenAt)}`
})

function formatStatusTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'recently'
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}
</script>

<template>
  <header class="flex h-21 shrink-0 items-center justify-between border-b border-border/70 px-7">
    <div class="flex min-w-0 items-center gap-3">
      <div class="grid size-11 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/12 text-xs font-bold text-primary">
        {{ title.slice(0, 2).toUpperCase() }}
      </div>

      <div class="min-w-0">
        <h1 class="truncate text-base font-extrabold text-foreground">
          {{ title }}
        </h1>

        <p
          :class="[
            'mt-1 truncate text-xs font-medium',
            typingLabel ? 'text-primary' : 'text-muted-foreground',
          ]"
        >
          {{ status }}
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        class="rounded-xl"
        aria-label="Start voice call"
      >
        <Phone class="size-4" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        class="rounded-xl"
        aria-label="Start video call"
      >
        <Video class="size-4" />
      </Button>

      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        class="rounded-xl"
        aria-label="Open chat actions"
      >
        <MoreHorizontal class="size-4" />
      </Button>
    </div>
  </header>
</template>
