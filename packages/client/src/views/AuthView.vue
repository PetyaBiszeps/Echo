<script setup lang="ts">
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import {
//   Label
// } from '@/components/ui/label'
</script>

<template>
  <section class="echo-auth-card">
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
      <form class="mt-8 space-y-6" />
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


  <!--
    <section>
    <main>
      <form>
        <div class="space-y-2">
          <Label
            for="username"
            class="text-xs font-bold leading-[1.35] text-muted-foreground"
          >
            Username
          </Label>

          <div class="echo-auth-field">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle
                cx="12"
                cy="7"
                r="4"
              />
            </svg>

            <Input
              id="username"
              placeholder="admin"
              class="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
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

          <div class="echo-auth-field">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <rect
                width="18"
                height="11"
                x="3"
                y="11"
                rx="2"
              />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>

            <Input
              id="password"
              type="password"
              placeholder="password"
              class="border-0 bg-transparent px-0 shadow-none focus-visible:border-0 focus-visible:ring-0"
            />

            <button
              class="echo-auth-icon-button"
              type="button"
              aria-label="Show password"
              tabindex="-1"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle
                  cx="12"
                  cy="12"
                  r="3"
                />
              </svg>
            </button>
          </div>
        </div>

        <Button
          type="button"
          class="h-11 w-full rounded-xl text-sm font-extrabold"
        >
          Sign in
        </Button>
      </form>
    </main>
  </section>
  -->
</template>
