<script setup lang="ts">
import { MessageCircle, Plus } from '@lucide/vue'
</script>

<template>
  <main class="relative z-10 grid h-full min-h-0 w-full place-items-center overflow-hidden px-6 py-10">
    <section class="flex min-h-75 w-full max-w-90 flex-col items-center rounded-2xl border border-border bg-card/88 px-7 py-7 text-center shadow-[0_24px_90px_color-mix(in_srgb,var(--primary)_8%,transparent)] backdrop-blur">
      <div class="grid size-19 place-items-center rounded-2xl border border-primary/25 bg-primary/12 text-primary shadow-[0_0_36px_color-mix(in_srgb,var(--primary)_14%,transparent)]">
        <MessageCircle class="size-8" />
      </div>

      <h1 class="mt-4 max-w-76 text-2xl font-extrabold leading-tight tracking-tight text-foreground">
        Select a chat or start a conversation
      </h1>

      <p class="mt-3 max-w-76 text-sm leading-6 text-muted-foreground">
        Choose a thread from the sidebar to continue messaging in Echo.
      </p>

      <div class="mt-7 inline-flex h-9 items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 text-xs font-bold text-primary">
        <Plus class="size-3.5" />
        New chat coming soon
      </div>
    </section>
  </main>
</template>
