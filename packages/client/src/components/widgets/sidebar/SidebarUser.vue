<script setup lang="ts">
const { name } = defineProps<{
  name: string
}>()
</script>

<template>
  <li :class="['sidebarUser']">
    {{ name }}
  </li>
</template>