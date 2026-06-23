<script setup lang="ts">
import useAuthStore from '@/store/auth.ts'
import useChatStore from '@/store/chats.ts'
import useUserSearch from '@/composables/useUserSearch.ts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader
} from '@/components/ui/sidebar'
import AppSidebarChatItem from '@/components/app/AppSidebarChatItem.vue'
import NewChatDialog from '@/components/app/NewChatDialog.vue'
import { MessageCircle, Plus, Search } from '@lucide/vue'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type {
  IChat,
  IUser
} from '@echo/shared'

defineProps<{
  mobileStatic?: boolean
}>()

const auth = useAuthStore()
const chatStore = useChatStore()
const route = useRoute()
const router = useRouter()
const isNewChatOpen = ref(false)
const searchQuery = ref('')
const creatingUsername = ref<string | null>(null)
const openUserChatError = ref<string | null>(null)

const selectedChatId = computed(() => getRouteChatId(route.params.chatId))
const {
  normalizedQuery,
  canSearch,
  results: userSearchResults,
  isSearching: isSearchingUsers,
  searchError: userSearchError,
  resetUserSearch
} = useUserSearch(searchQuery)
const hasSearchQuery = computed(() => normalizedQuery.value.length > 0)
const filteredChats = computed(() => {
  if (!hasSearchQuery.value) {
    return chatStore.chats
  }

  const query = normalizedQuery.value.toLowerCase()

  return chatStore.chats.filter(chat => getChatSearchText(chat).includes(query))
})
const visibleUserResults = computed(() => userSearchResults.value.filter((user) => {
  return !isCurrentUser(user) && !findExistingDirectChat(user)
}))

onMounted(() => {
  void chatStore.fetchChats()
})

function getChatTitle(chat: IChat) {
  return chat.name
    || chat.title
    || chatStore.getDirectChatPeer(chat)?.username
    || 'Untitled chat'
}

function isDirectChatPeerOnline(chat: IChat) {
  return chatStore.getDirectChatPeerPresence(chat)?.isOnline ?? false
}

function getRouteChatId(value: unknown) {
  return Array.isArray(value)
    ? value[0] ?? null
    : typeof value === 'string'
      ? value
      : null
}

async function selectChat(chat: IChat) {
  await router.push({
    name: 'chat',
    params: {
      chatId: chat.id
    }
  })

  clearSearch()
}

async function openCreatedChat(chat: IChat) {
  await selectChat(chat)
  isNewChatOpen.value = false
}

async function openUserChat(user: IUser) {
  if (creatingUsername.value) {
    return
  }

  const existingChat = findExistingDirectChat(user)

  if (existingChat) {
    await selectChat(existingChat)
    return
  }

  openUserChatError.value = null
  chatStore.clearCreateDirectChatError()
  creatingUsername.value = user.username

  const chat = await chatStore.createDirectChat(user.username)

  creatingUsername.value = null

  if (!chat) {
    openUserChatError.value = chatStore.createDirectChatError || 'Unable to start chat. Please try again.'
    return
  }

  await selectChat(chat)
}

function getChatLastMessage(chat: IChat) {
  return chat.latestMessage?.content
    || chat.lastMessage?.content
    || 'No messages yet'
}

function getChatSearchText(chat: IChat) {
  return [
    getChatTitle(chat),
    chat.participants.map(participant => participant.username).join(' '),
    chat.latestMessage?.content,
    chat.lastMessage?.content
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function findExistingDirectChat(user: IUser) {
  const normalizedUsername = user.username.toLowerCase()

  return chatStore.chats.find(chat => chat.participants.length <= 2 && chat.participants.some(participant => {
    return participant.id === user.id || participant.username.toLowerCase() === normalizedUsername
  })) ?? null
}

function isCurrentUser(user: IUser) {
  return user.id === auth.user?.id || user.username === auth.user?.username
}

function getUserInitials(user: IUser) {
  return user.username.slice(0, 2).toUpperCase()
}

function clearSearch() {
  resetUserSearch(true)
  openUserChatError.value = null
  chatStore.clearCreateDirectChatError()
}

function getChatTime(chat: IChat) {
  return formatSidebarTime(
    chat.latestMessage?.timestamp
    || chat.latestMessage?.createdAt
    || chat.lastMessage?.timestamp
    || chat.lastMessage?.createdAt
    || chat.updatedAt
  )
}

function formatSidebarTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return new Intl.DateTimeFormat(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const yesterday = new Date(now)

  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat(undefined, date.getFullYear() === now.getFullYear()
    ? {
      month: 'short',
      day: 'numeric'
    }
    : {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
}
</script>

<template>
  <Sidebar
    collapsible="offcanvas"
    :mobile-static="mobileStatic"
    class="z-30 border-r border-sidebar-border max-md:border-r-0"
  >
    <SidebarHeader class="gap-4 p-5 pb-3">
      <div class="flex items-center justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div class="echo-mark size-9 shrink-0 rounded-xl">
            <span />
          </div>

          <div class="min-w-0">
            <h1 class="truncate text-sm font-bold leading-none text-sidebar-foreground">
              Echo
            </h1>

            <p class="mt-1 truncate text-[11px] font-medium text-sidebar-foreground/60">
              Messenger
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          class="size-9 shrink-0 rounded-xl border border-sidebar-border bg-sidebar-accent text-sidebar-foreground hover:bg-sidebar-accent/80"
          aria-label="Start new chat"
          @click="isNewChatOpen = true"
        >
          <Plus class="size-4" />
        </Button>
      </div>

      <label
        for="sidebar-chat-search"
        class="flex h-11 items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent px-3 text-sidebar-foreground/60 focus-within:ring-2 focus-within:ring-sidebar-ring/60"
      >
        <Search class="size-4 shrink-0" />
        <span class="sr-only">Search chats</span>
        <Input
          v-model="searchQuery"
          id="sidebar-chat-search"
          name="chatSearch"
          placeholder="Search chats or users"
          class="h-full border-0 bg-transparent px-0 py-0 text-xs font-medium text-sidebar-foreground shadow-none placeholder:text-sidebar-foreground/50 focus-visible:ring-0 focus-visible:border-0"
        />
      </label>
    </SidebarHeader>

    <SidebarContent class="px-5 py-3">
      <ul class="flex flex-col gap-1.5">
        <template v-if="chatStore.isLoadingChats && !hasSearchQuery">
          <li
            v-for="item in 4"
            :key="item"
            class="flex h-18 items-center gap-3 rounded-xl px-3"
            aria-hidden="true"
          >
            <span class="size-11 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />

            <span class="flex min-w-0 flex-1 flex-col gap-2">
              <span class="h-3 w-2/3 animate-pulse rounded-full bg-sidebar-accent" />
              <span class="h-2.5 w-4/5 animate-pulse rounded-full bg-sidebar-accent/80" />
            </span>
          </li>
        </template>

        <li
          v-else-if="chatStore.chatListError && !hasSearchQuery"
          class="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-4"
        >
          <p class="text-xs font-medium leading-5 text-sidebar-foreground/70">
            {{ chatStore.chatListError }}
          </p>

          <Button
            type="button"
            size="sm"
            variant="secondary"
            class="mt-3 h-8 rounded-lg border border-sidebar-border bg-sidebar text-xs text-sidebar-foreground hover:bg-sidebar/80"
            @click="chatStore.fetchChats"
          >
            Retry
          </Button>
        </li>

        <li
          v-else-if="!chatStore.hasChats && !hasSearchQuery"
          class="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-4 text-xs font-medium leading-5 text-sidebar-foreground/70"
        >
          No chats yet.
        </li>

        <template v-else-if="hasSearchQuery">
          <li>
            <section class="flex flex-col gap-2">
              <h2 class="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                Chats
              </h2>

              <ul
                v-if="filteredChats.length > 0"
                class="flex flex-col gap-1.5"
              >
                <li
                  v-for="chat in filteredChats"
                  :key="chat.id"
                >
                  <AppSidebarChatItem
                    :title="getChatTitle(chat)"
                    :last-message="getChatLastMessage(chat)"
                    :time="getChatTime(chat)"
                    :unread-count="chat.unreadCount"
                    :active="selectedChatId === chat.id"
                    :is-online="isDirectChatPeerOnline(chat)"
                    @click="selectChat(chat)"
                  />
                </li>
              </ul>

              <p
                v-else
                class="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-4 text-xs font-medium leading-5 text-sidebar-foreground/70"
              >
                No matching chats.
              </p>
            </section>
          </li>

          <li>
            <section class="mt-4 flex flex-col gap-2">
              <h2 class="px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                Users
              </h2>

              <p
                v-if="!canSearch"
                class="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-4 text-xs font-medium leading-5 text-sidebar-foreground/70"
              >
                Type at least 2 characters to search users.
              </p>

              <div
                v-else-if="isSearchingUsers"
                class="flex flex-col gap-1.5"
                aria-live="polite"
              >
                <div
                  v-for="item in 3"
                  :key="item"
                  class="flex h-16 items-center gap-3 rounded-xl px-3"
                  aria-hidden="true"
                >
                  <span class="size-10 shrink-0 animate-pulse rounded-full bg-sidebar-accent" />

                  <span class="flex min-w-0 flex-1 flex-col gap-2">
                    <span class="h-3 w-2/3 animate-pulse rounded-full bg-sidebar-accent" />
                    <span class="h-2.5 w-1/2 animate-pulse rounded-full bg-sidebar-accent/80" />
                  </span>
                </div>
              </div>

              <p
                v-else-if="userSearchError"
                class="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-xs font-medium leading-5 text-destructive"
              >
                {{ userSearchError }}
              </p>

              <template v-else>
                <p
                  v-if="openUserChatError"
                  class="rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-xs font-medium leading-5 text-destructive"
                >
                  {{ openUserChatError }}
                </p>

                <ul
                  v-if="visibleUserResults.length > 0"
                  class="flex flex-col gap-1.5"
                >
                  <li
                    v-for="user in visibleUserResults"
                    :key="user.id"
                  >
                    <button
                      type="button"
                      class="flex h-16 w-full min-w-0 items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-sidebar-accent/80 focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="Boolean(creatingUsername)"
                      @click="openUserChat(user)"
                    >
                      <span class="grid size-10 shrink-0 place-items-center rounded-full border border-sidebar-primary/35 bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
                        {{ getUserInitials(user) }}
                      </span>

                      <span class="min-w-0 flex-1">
                        <span class="block truncate text-sm font-bold text-sidebar-foreground">
                          {{ user.username }}
                        </span>
                        <span class="block truncate text-xs font-medium text-sidebar-foreground/55">
                          Start direct chat
                        </span>
                      </span>

                      <span
                        v-if="creatingUsername === user.username"
                        class="shrink-0 text-xs font-bold text-sidebar-primary"
                      >
                        Opening...
                      </span>
                    </button>
                  </li>
                </ul>

                <p
                  v-else
                  class="rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-4 text-xs font-medium leading-5 text-sidebar-foreground/70"
                >
                  No new users found.
                </p>
              </template>
            </section>
          </li>
        </template>

        <template v-else>
          <li
            v-for="chat in filteredChats"
            :key="chat.id"
          >
            <AppSidebarChatItem
              :title="getChatTitle(chat)"
              :last-message="getChatLastMessage(chat)"
              :time="getChatTime(chat)"
              :unread-count="chat.unreadCount"
              :active="selectedChatId === chat.id"
              :is-online="isDirectChatPeerOnline(chat)"
              @click="selectChat(chat)"
            />
          </li>
        </template>
      </ul>
    </SidebarContent>

    <SidebarFooter class="p-5 pt-3">
      <div class="flex min-w-0 items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent px-3 py-2.5">
        <div class="relative shrink-0">
          <div class="grid size-9 place-items-center rounded-full border border-sidebar-primary/35 bg-sidebar-primary/15 text-xs font-bold text-sidebar-primary">
            {{ auth.user?.username.slice(0, 2).toUpperCase() || 'EC' }}
          </div>

          <!-- TODO: replace with an Echo semantic status token when status states are modeled. -->
          <span class="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-sidebar-accent bg-green-500" />
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-sidebar-foreground">
            {{ auth.user?.username || 'Echo User' }}
          </p>

          <p class="truncate text-xs font-medium text-sidebar-foreground/60">
            Available for testing
          </p>
        </div>

        <MessageCircle class="size-4 shrink-0 text-sidebar-primary" />
      </div>
    </SidebarFooter>
  </Sidebar>

  <NewChatDialog
    v-model:open="isNewChatOpen"
    @chat-created="openCreatedChat"
  />
</template>
