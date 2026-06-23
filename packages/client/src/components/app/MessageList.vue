<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import { nextTick, ref, watch } from 'vue'
import type { IMessage } from '@echo/shared'

const props = defineProps<{
  messages: IMessage[]
  hasOlderMessages?: boolean
  isLoadingOlder?: boolean
  olderError?: string | null
}>()

const emit = defineEmits<{
  loadOlder: []
}>()

const auth = useAuthStore()
const scrollContainer = ref<HTMLElement | null>(null)
const pendingOlderScroll = ref<{
  scrollHeight: number
  scrollTop: number
} | null>(null)

watch(() => props.messages.map(message => message.id), async (messageIds, previousMessageIds) => {
  await nextTick()
  const container = scrollContainer.value

  if (!container) {
    return
  }

  if (pendingOlderScroll.value) {
    container.scrollTop = pendingOlderScroll.value.scrollTop + container.scrollHeight - pendingOlderScroll.value.scrollHeight
    pendingOlderScroll.value = null
    return
  }

  const previousLastMessageId = previousMessageIds?.at(-1)
  const nextLastMessageId = messageIds.at(-1)

  if (!previousMessageIds || previousMessageIds.length === 0 || previousLastMessageId !== nextLastMessageId) {
    container.scrollTo({
      top: container.scrollHeight
    })
  }
}, {
  immediate: true
})

watch(() => props.isLoadingOlder, (isLoadingOlder, wasLoadingOlder) => {
  if (wasLoadingOlder && !isLoadingOlder) {
    window.setTimeout(() => {
      pendingOlderScroll.value = null
    })
  }
})

function isMine(message: IMessage) {
  return message.senderId === auth.user?.id
}

function formatMessageTime(message: IMessage) {
  const date = new Date(message.timestamp || message.createdAt || '')

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function loadOlderMessages() {
  const container = scrollContainer.value

  if (container) {
    pendingOlderScroll.value = {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop
    }
  }

  emit('loadOlder')
}
</script>

<template>
  <main
    ref="scrollContainer"
    class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 md:gap-5 md:px-11 md:py-7"
  >
    <div
      v-if="messages.length === 0"
      class="m-auto max-w-sm rounded-2xl border border-border/70 bg-card/80 px-5 py-4 text-center shadow-sm"
    >
      <p class="text-sm font-bold text-card-foreground">
        No messages yet
      </p>

      <p class="mt-1 text-xs font-medium leading-5 text-muted-foreground">
        Message history for this chat will appear here.
      </p>
    </div>

    <template v-else>
      <div
        v-if="hasOlderMessages || olderError"
        class="flex flex-col items-center gap-2"
      >
        <p
          v-if="olderError"
          class="max-w-sm text-center text-xs font-medium leading-5 text-destructive"
        >
          {{ olderError }}
        </p>

        <button
          type="button"
          class="rounded-full border border-border/70 bg-card px-4 py-2 text-xs font-bold text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoadingOlder"
          @click="loadOlderMessages"
        >
          {{ isLoadingOlder ? 'Loading older messages...' : olderError ? 'Try again' : 'Load older messages' }}
        </button>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex max-w-[min(34rem,86%)] flex-col gap-1 rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm md:max-w-[min(34rem,78%)]',
          isMine(message)
            ? 'ml-auto bg-primary text-primary-foreground'
            : 'mr-auto bg-card text-card-foreground border border-border/70',
        ]"
      >
        <span class="min-w-0 whitespace-pre-wrap break-words">{{ message.content }}</span>

        <span
          :class="[
            'text-[10px] font-medium leading-none',
            isMine(message) ? 'text-primary-foreground/65' : 'text-muted-foreground',
          ]"
        >
          {{ formatMessageTime(message) }}
        </span>
      </div>
    </template>
  </main>
</template>
