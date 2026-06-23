<script setup lang="ts">
import AppSidebar from '@/components/app/AppSidebar.vue'
import {
  SidebarInset,
  SidebarProvider
} from '@/components/ui/sidebar'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const selectedChatId = computed(() => getRouteChatId(route.params.chatId))

function getRouteChatId(value: unknown) {
  return Array.isArray(value)
    ? value[0] ?? null
    : typeof value === 'string'
      ? value
      : null
}
</script>

<template>
  <SidebarProvider
    :default-open="true"
    class="h-dvh min-h-0 overflow-hidden bg-background text-foreground"
    style="--echo-sidebar-width: clamp(20rem, 25.5vw, 23rem)"
  >
    <AppSidebar :mobile-static="!selectedChatId" />

    <SidebarInset
      :class="[
        'h-full min-h-0 min-w-0 overflow-hidden',
        selectedChatId ? 'flex' : 'hidden md:flex',
      ]"
    >
      <RouterView />
    </SidebarInset>
  </SidebarProvider>
</template>
