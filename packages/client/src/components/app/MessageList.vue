<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import { nextTick, ref, watch } from 'vue'
import type { IMessage } from '@echo/shared'

const props = defineProps<{
  messages: IMessage[]
}>()

const auth = useAuthStore()
const scrollContainer = ref<HTMLElement | null>(null)

watch(() => props.messages.length, async () => {
  await nextTick()
  scrollContainer.value?.scrollTo({
    top: scrollContainer.value.scrollHeight
  })
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
</script>

<template>
  <main
    ref="scrollContainer"
    class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-11 py-7"
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
        v-for="message in messages"
        :key="message.id"
        :class="[
          'flex max-w-[min(34rem,78%)] flex-col gap-1 rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm',
          isMine(message)
            ? 'ml-auto bg-primary text-primary-foreground'
            : 'mr-auto bg-card text-card-foreground border border-border/70',
        ]"
      >
        <span>{{ message.content }}</span>

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
