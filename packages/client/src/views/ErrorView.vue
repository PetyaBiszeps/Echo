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
  <section class="border border-border rounded-3xl bg-card p-8 text-card-foreground shadow-sm">
    <header class="flex justify-center gap-2 mb-6">
      <div class="h-8 w-2 rounded-full bg-primary" />
      <div class="h-8 w-2 rounded-full bg-primary" />
      <div class="h-8 w-2 rounded-full bg-primary" />
      <div class="h-8 w-2 rounded-full bg-primary" />
    </header>

    <main>
      <h1 class="flex items-center gap-2 text-4xl font-semibold">
        <i class="block size-3 rounded-full bg-primary" />
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
