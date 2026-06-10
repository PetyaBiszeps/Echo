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
import type {
  IUser
} from '@echo/shared'

// Init
const chatStore = useChatStore()

// Constants
const search = ref<string | number>('')
const users = ref<IUser[]>([])
const searching = ref(false)
const searchError = ref<string | null>(null)
const query = computed(() => search.value.toString().trim())
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
  const chat = await chatStore.createChat(user.username)

  if (chat) {
    search.value = ''
    users.value = []
    searchError.value = null
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
    return
  }

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
            v-for="user in users"
            :key="user.id"

            :class="['sidebarChat']"
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
