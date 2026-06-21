<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Eye,
  Lock,
  User
} from '@lucide/vue'
</script>

<template>
  <section class="w-fit p-6 bg-surface-auth-card border border-border rounded-3xl">
    <header class="text-center">
      <div class="echo-mark mx-auto size-14 rounded-2xl">
        <span />
      </div>

      <h1 class="text-3xl font-extrabold tracking-tight mt-6">
        Welcome to Echo
      </h1>

      <p class="text-sm text-muted-foreground mt-1">
        Sign in to continue your conversations.
      </p>
    </header>

    <main>
      <form class="mt-8 space-y-6">
        <div class="space-y-2">
          <Label
            for="username"
            class="text-xs font-bold leading-[1.35] text-muted-foreground"
          >
            Username
          </Label>

          <div class="echo-input">
            <User class="size-4 shrink-0 stroke-current" />

            <Input
              id="username"
              name="username"
              autocomplete="username"
              placeholder="admin"
              class="h-full px-0 bg-transparent border-0 shadow-none font-semibold text-foreground placeholder:text-muted-foreground placeholder:font-normal focus-visible:border-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label
            for="password"
            class="text-xs font-bold leading-[1.35] text-muted-foreground"
          >
            Password
          </Label>

          <div class="echo-input">
            <Lock class="size-4 shrink-0 stroke-current" />

            <Input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="password"
              class="h-full border-0 bg-transparent px-0 font-semibold text-foreground shadow-none placeholder:text-muted-foreground placeholder:font-normal focus-visible:border-0 focus-visible:ring-0"
            />

            <button
              class="grid size-6 shrink-0 place-items-center text-muted-foreground"
              type="button"
            >
              <Eye class="size-4 shrink-0 stroke-current" />
            </button>
          </div>
        </div>

        <Button
          type="button"
          class="w-full h-11 rounded-xl text-sm font-extrabold"
        >
          Sign in
        </Button>
      </form>
    </main>

    <footer class="text-center mt-4">
      <a
        class="text-primary text-sm font-bold no-underline hover:underline underline-offset-4"
        href="/auth"
      >
        Create an account
      </a>

      <p class="text-xs text-muted-foreground mx-auto mt-6">
        Use your Echo username and password to return to your message history.
      </p>
    </footer>
  </section>
</template>
