<script setup lang="ts">
import SidebarUser from '@/components/widgets/sidebar/SidebarUser.vue'
import { ref } from 'vue'

const members = ref<string[]>([
  'Ya', 'Mykyta', 'Danya', 'Vlad', 'Egor', 'Dima', 'Danya',
  'Ya', 'Mykyta', 'Danya', 'Vlad', 'Egor', 'Dima', 'Danya'
])
</script>

<template>
  <ul :class="['sidebarList']">
    <SidebarUser
      v-for="member in members"
      :key="member"
      :name="member"
    />
  </ul>
</template>