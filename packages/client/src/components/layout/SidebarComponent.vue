<script setup lang="ts">
import SidebarList from '@/components/widgets/sidebar/SidebarList.vue'
import BaseInput from '@/components/ui/base/BaseInput.vue'
import { ref } from 'vue'

  // Constants
const search = ref<string | number>('')
</script>

<template>
  <aside :class="['sidebar']">
    <header>
      <div :class="['search']">
        <BaseInput
          v-model="search"

          :id="'search'"
          :name="'search'"
          :type="'search'"
          :placeholder="'Search'"
        />
      </div>

      <nav>
        <ul>
          <li />
        </ul>
      </nav>
    </header>

    <main>
      <SidebarList />
    </main>
  </aside>
</template>