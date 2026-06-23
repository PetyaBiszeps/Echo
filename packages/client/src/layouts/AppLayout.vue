<script setup lang="ts">
import AppSidebar from '@/components/app/AppSidebar.vue'
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar'
</script>

<template>
  <SidebarProvider
    :default-open="true"
    class="h-dvh min-h-0 overflow-hidden bg-background text-foreground"
    style="--echo-sidebar-width: clamp(20rem, 25.5vw, 23rem)"
  >
    <AppSidebar />

    <SidebarInset class="h-full min-h-0 min-w-0 overflow-hidden">
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
