<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  useRouter
} from 'vue-router'

// Init
const router = useRouter()

// Methods
async function backToHome() {
  await router.push('/')
}
</script>

<template>
  <section class="echo-card">
    <header class="flex justify-center gap-2 mb-6">
      <div class="echo-signal-bar" />
      <div class="echo-signal-bar" />
      <div class="echo-signal-bar" />
      <div class="echo-signal-bar" />
    </header>

    <main>
      <h1 class="flex items-center gap-2 text-4xl font-semibold">
        <i class="inline-block size-2 rounded-full bg-destructive animate-[blink_1.8s_ease-in-out_infinite]" />
        <span>404</span>
      </h1>

      <p class="mt-3 text-muted-foreground">
        Page you were looking for does not exists.
      </p>
    </main>

    <footer class="mt-6">
      <Button @click="backToHome">
        Back to Home
      </Button>
    </footer>
  </section>
</template>
