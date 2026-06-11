<script setup lang="ts">
import SidebarSearch from '@/components/widgets/sidebar/SidebarSearch.vue'
import SidebarList from '@/components/widgets/sidebar/SidebarList.vue'
import SidebarTab from '@/components/widgets/sidebar/SidebarTab.vue'
import getErrorMessage from '@/utils/getErrorMessage'
import useChatStore from '@/stores/chats'
import http from '@/constants/http'
import {
  computed,
  onBeforeUnmount,
  ref,
  watch
} from 'vue'
import {
  useRouter
} from 'vue-router'
import type {
  IUser
} from '@echo/shared'

// Init
const chatStore = useChatStore()
const router = useRouter()

// Constants
const search = ref<string | number>('')
const users = ref<IUser[]>([])
const searching = ref(false)
const searchError = ref<string | null>(null)
const highlightedIndex = ref(-1)
const query = computed(() => search.value.toString().trim())
const creatingChatUserIds = new Set<string>()
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let searchRequestId = 0

// Methods
async function searchUsers(value: string, requestId: number) {
  try {
    searching.value = true
    searchError.value = null

    const { data } = await http.get('/users/search', {
      params: {
        q: value
      }
    })

    if (requestId === searchRequestId) {
      users.value = data.data
      highlightedIndex.value = users.value.length > 0 ? 0 : -1
    }
  } catch (err: unknown) {
    if (requestId === searchRequestId) {
      users.value = []
      searchError.value = getErrorMessage(err)
    }
  } finally {
    if (requestId === searchRequestId) {
      searching.value = false
    }
  }
}

async function chooseUser(user: IUser) {
  if (creatingChatUserIds.has(user.id)) {
    return
  }

  creatingChatUserIds.add(user.id)

  try {
    const chat = await chatStore.createChat(user.username)

    if (chat) {
      closeSearch()
      await router.push({
        name: 'chat',
        params: {
          chatId: chat.id
        }
      })
    }
  } finally {
    creatingChatUserIds.delete(user.id)
  }
}

function closeSearch() {
  searchRequestId += 1

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  search.value = ''
  users.value = []
  searching.value = false
  searchError.value = null
  highlightedIndex.value = -1
}

function moveHighlightedIndex(offset: number) {
  if (users.value.length === 0) {
    highlightedIndex.value = -1
    return
  }

  const nextIndex = highlightedIndex.value + offset

  highlightedIndex.value = (nextIndex + users.value.length) % users.value.length
}

function handleSearchKeydown(event: KeyboardEvent) {
  if (!query.value) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSearch()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveHighlightedIndex(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveHighlightedIndex(-1)
    return
  }

  if (event.key === 'Enter') {
    const user = users.value[highlightedIndex.value]

    if (user) {
      event.preventDefault()
      void chooseUser(user)
    }
  }
}

watch(query, (value) => {
  searchRequestId += 1

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!value) {
    users.value = []
    searching.value = false
    searchError.value = null
    highlightedIndex.value = -1
    return
  }

  highlightedIndex.value = -1

  const requestId = searchRequestId

  searchTimeout = setTimeout(() => {
    void searchUsers(value, requestId)
  }, 300)
})

onBeforeUnmount(() => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<template>
  <aside :class="['sidebar']">
    <header>
      <SidebarSearch
        v-model="search"

        :id="'search'"
        :name="'search'"
        :type="'search'"
        :placeholder="'Search'"

        @keydown="handleSearchKeydown"
      />

      <SidebarTab />
    </header>

    <main>
      <SidebarList
        v-if="!query"
        :search="''"
      />

      <section
        v-else
        :class="['sidebarSearchResults']"
      >
        <p v-if="searching">
          Searching...
        </p>

        <p v-else-if="searchError">
          {{ searchError }}
        </p>

        <p v-else-if="users.length === 0">
          No users found
        </p>

        <ul
          v-else
          :class="['sidebarList']"
        >
          <li
            v-for="(user, index) in users"
            :key="user.id"

            :class="['sidebarChat', {
              highlighted: highlightedIndex === index
            }]"
            @mouseenter="highlightedIndex = index"
            @click="chooseUser(user)"
          >
            <img
              src="@/assets/icons/avatar.svg"
              :alt="user.username"
            >

            <section>
              <h4>{{ user.username }}</h4>

              <p>
                <span :class="['message']">Start chat</span>
              </p>
            </section>
          </li>
        </ul>
      </section>
    </main>
  </aside>
</template>
