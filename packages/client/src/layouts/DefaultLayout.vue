<script setup lang="ts">
import SidebarComponent from '@/components/layout/sidebar/SidebarComponent.vue'
</script>

<template>
  <div :class="['defaultLayout']">
    <SidebarComponent />

    <RouterView />
  </div>
</template>