<script setup lang="ts">
import BaseInput from '@/components/ui/base/BaseInput.vue'
import { ref } from 'vue'

  // Constants
const search = ref<string | number>('')

const members = ref<string[]>([
  'Ya', 'Mykyta', 'Danya', 'Vlad', 'Egor', 'Dima', 'Danya',
  'Ya', 'Mykyta', 'Danya', 'Vlad', 'Egor', 'Dima', 'Danya'
])
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
      <ul>
        <li
          v-for="member in members"
          :key="member"
        >
          {{ member }}
        </li>
      </ul>
    </main>
  </aside>
</template>