<script setup lang="ts">
import SidebarSearch from '@/components/widgets/sidebar/SidebarSearch.vue'
import SidebarList from '@/components/widgets/sidebar/SidebarList.vue'
import SidebarTab from '@/components/widgets/sidebar/SidebarTab.vue'
import BaseButton from '@/components/ui/base/BaseButton.vue'
import BaseInput from '@/components/ui/base/BaseInput.vue'
import useChatStore from '@/stores/chats'
import {
  ref
} from 'vue'

// Init
const chatStore = useChatStore()

// Constants
const search = ref<string | number>('')
const username = ref<string | number>('')

// Methods
async function createChat() {
  const chat = await chatStore.createChat(username.value.toString())

  if (chat) {
    username.value = ''
  }
}
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

      <form @submit.prevent="createChat">
        <BaseInput
          v-model="username"

          :id="'chat-username'"
          :name="'chat-username'"
          :type="'text'"
          :placeholder="'Username'"
          :disabled="chatStore.creatingChat"
        />

        <BaseButton
          :name="'Start chat'"
          :type="'submit'"
          :disabled="chatStore.creatingChat"
        />
      </form>

      <SidebarTab />
    </header>

    <main>
      <SidebarList :search="search" />
    </main>
  </aside>
</template>
