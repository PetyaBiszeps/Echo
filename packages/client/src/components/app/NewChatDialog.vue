<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import useChatStore from '@/store/chats.ts'
import useAPI from '@/composables/useAPI.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  computed,
  onUnmounted,
  ref,
  watch
} from 'vue'
import type {
  IChat,
  IUser
} from '@echo/shared'

type UserSearchResponse = {
  success: true
  data: IUser[]
}

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [open: boolean]
  'chat-created': [chat: IChat]
}>()

const http = useAPI()
const auth = useAuthStore()
const chatStore = useChatStore()

const query = ref('')
const results = ref<IUser[]>([])
const isSearching = ref(false)
const searchError = ref<string | null>(null)
const creatingUsername = ref<string | null>(null)
const normalizedQuery = computed(() => query.value.trim())
const canSearch = computed(() => normalizedQuery.value.length >= 2)
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)
  }
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

watch(() => props.open, (open) => {
  if (!open) {
    resetState()
  }
})

watch(normalizedQuery, (value) => {
  clearSearchTimer()
  searchError.value = null
  searchRequestId += 1

  if (!value) {
    results.value = []
    isSearching.value = false
    return
  }

  if (value.length < 2) {
    results.value = []
    isSearching.value = false
    return
  }

  const requestId = searchRequestId

  searchTimer = setTimeout(() => {
    void searchUsers(value, requestId)
  }, 250)
})

onUnmounted(() => {
  clearSearchTimer()
})

async function searchUsers(value: string, requestId: number) {
  const accessToken = auth.token?.accessToken

  if (!accessToken) {
    results.value = []
    searchError.value = 'Sign in again to search users.'
    return
  }

  isSearching.value = true

  try {
    const response = await http.get<UserSearchResponse>('/users/search', {
      query: {
        q: value
      },
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (requestId === searchRequestId) {
      results.value = response.data
      searchError.value = null
    }
  } catch {
    if (requestId === searchRequestId) {
      results.value = []
      searchError.value = 'Unable to search users. Please try again.'
    }
  } finally {
    if (requestId === searchRequestId) {
      isSearching.value = false
    }
  }
}

async function startChat(user: IUser) {
  if (creatingUsername.value) {
    return
  }

  creatingUsername.value = user.username
  const chat = await chatStore.createDirectChat(user.username)

  creatingUsername.value = null

  if (!chat || !props.open) {
    return
  }

  emit('chat-created', chat)
}

function resetState() {
  clearSearchTimer()
  searchRequestId += 1
  query.value = ''
  results.value = []
  isSearching.value = false
  searchError.value = null
  creatingUsername.value = null
  chatStore.clearCreateDirectChatError()
}

function clearSearchTimer() {
  if (!searchTimer) {
    return
  }

  clearTimeout(searchTimer)
  searchTimer = null
}
</script>

<template>
  <Sheet v-model:open="isOpen">
    <SheetContent class="w-[min(26rem,calc(100vw-2rem))] gap-0 border-sidebar-border bg-sidebar text-sidebar-foreground sm:max-w-[26rem]">
      <SheetHeader class="border-b border-sidebar-border px-5 py-5 text-left">
        <SheetTitle class="text-lg font-extrabold text-sidebar-foreground">
          New chat
        </SheetTitle>

        <SheetDescription class="text-xs leading-5 text-sidebar-foreground/60">
          Search for a person by username and start a direct conversation.
        </SheetDescription>
      </SheetHeader>

      <div class="flex min-h-0 flex-1 flex-col gap-4 px-5 py-5">
        <label class="flex flex-col gap-2">
          <span class="text-xs font-bold text-sidebar-foreground/70">Username</span>
          <Input
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search users"
            class="h-11 border-sidebar-border bg-sidebar-accent text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/45"
          />
        </label>

        <p
          v-if="chatStore.createDirectChatError"
          class="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          {{ chatStore.createDirectChatError }}
        </p>

        <p
          v-if="searchError"
          class="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
        >
          {{ searchError }}
        </p>

        <div class="min-h-48 overflow-hidden rounded-xl border border-sidebar-border bg-sidebar-accent/55">
          <div
            v-if="!normalizedQuery"
            class="flex h-48 items-center justify-center px-6 text-center text-xs font-medium leading-5 text-sidebar-foreground/55"
          >
            Enter at least 2 characters to search for users.
          </div>

          <div
            v-else-if="!canSearch"
            class="flex h-48 items-center justify-center px-6 text-center text-xs font-medium leading-5 text-sidebar-foreground/55"
          >
            Keep typing to search.
          </div>

          <div
            v-else-if="isSearching"
            class="flex h-48 flex-col justify-center gap-2 px-4"
            aria-live="polite"
          >
            <span
              v-for="item in 3"
              :key="item"
              class="h-12 animate-pulse rounded-lg bg-sidebar/80"
            />
          </div>

          <div
            v-else-if="results.length === 0"
            class="flex h-48 items-center justify-center px-6 text-center text-xs font-medium leading-5 text-sidebar-foreground/55"
          >
            No users found.
          </div>

          <ul
            v-else
            class="max-h-70 overflow-auto p-2"
          >
            <li
              v-for="user in results"
              :key="user.id"
            >
              <button
                type="button"
                class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-sidebar focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="Boolean(creatingUsername)"
                @click="startChat(user)"
              >
                <span class="grid size-10 shrink-0 place-items-center rounded-full border border-sidebar-primary/35 bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
                  {{ user.username.slice(0, 2).toUpperCase() }}
                </span>

                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-bold text-sidebar-foreground">
                    {{ user.username }}
                  </span>
                  <span class="block text-xs font-medium text-sidebar-foreground/55">
                    Start direct chat
                  </span>
                </span>

                <span
                  v-if="creatingUsername === user.username"
                  class="text-xs font-bold text-sidebar-primary"
                >
                  Opening...
                </span>
              </button>
            </li>
          </ul>
        </div>

        <Button
          type="button"
          variant="secondary"
          class="h-10 rounded-xl border border-sidebar-border bg-sidebar-accent text-xs font-bold text-sidebar-foreground hover:bg-sidebar-accent/80"
          @click="emit('update:open', false)"
        >
          Cancel
        </Button>
      </div>
    </SheetContent>
  </Sheet>
</template>
