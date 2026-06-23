<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import useChatStore from '@/store/chats.ts'
import { formatLastSeen } from '@/utils/date/formatLastSeen.ts'
import { ChevronLeft, MoreHorizontal, Phone, Video } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { IChat } from '@echo/shared'

const props = defineProps<{
  chat?: IChat | null
  typingLabel?: string | null
}>()

const auth = useAuthStore()
const chatStore = useChatStore()
const router = useRouter()

const title = computed(() => props.chat?.name
  || props.chat?.title
  || props.chat?.participants.find(participant => participant.id !== auth.user?.id)?.username
  || 'Selected chat')

const status = computed(() => {
  if (props.typingLabel) {
    return props.typingLabel
  }

  const presence = chatStore.getDirectChatPeerPresence(props.chat)

  if (!presence) {
    return 'Conversation'
  }

  if (presence.isOnline) {
    return 'Online'
  }

  return presence.lastSeenAt
    ? `Last seen ${formatLastSeen(presence.lastSeenAt)}`
    : 'Offline'
})

function goBackToChats() {
  void router.push({
    name: 'chats'
  })
}
</script>

<template>
  <header class="flex h-18 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-3 md:h-21 md:px-7">
    <div class="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
      <Button
        type="button"
        variant="secondary"
        size="icon-sm"
        class="shrink-0 rounded-xl md:hidden"
        aria-label="Back to chats"
        @click="goBackToChats"
      >
        <ChevronLeft class="size-4" />
      </Button>

      <div class="grid size-10 shrink-0 place-items-center rounded-full border border-primary/30 bg-primary/12 text-xs font-bold text-primary md:size-11">
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

    <div class="flex shrink-0 items-center gap-2">
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
