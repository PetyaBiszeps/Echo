<script setup lang="ts">
import SidebarSearch from '@/components/widgets/sidebar/SidebarSearch.vue'
import SidebarList from '@/components/widgets/sidebar/SidebarList.vue'
import SidebarTab from '@/components/widgets/sidebar/SidebarTab.vue'
import {
  ref
} from 'vue'

  // Constants
const search = ref<string | number>('')
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
      <SidebarList :search="search" />
    </main>
  </aside>
</template>