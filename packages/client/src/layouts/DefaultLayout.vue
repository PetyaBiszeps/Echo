<script setup lang="ts">
import SidebarComponent from '@/components/layout/SidebarComponent.vue'
</script>

<template>
  <div :class="['defaultLayout']">
    <SidebarComponent />

    <RouterView />
  </div>
</template>