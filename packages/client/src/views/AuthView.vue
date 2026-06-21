<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Label
} from '@/components/ui/label'
</script>

<template>
  <section>
    <header class="echo-auth-brand">
      <div
        class="echo-mark"
        aria-hidden="true"
      >
        <span />
      </div>

      <div>
        <p class="text-xl font-extrabold leading-tight text-foreground">
          Echo
        </p>

        <p class="text-[11px] font-semibold leading-tight text-muted-foreground">
          Secure messenger
        </p>
      </div>
    </header>

    <main
      class="echo-auth-card"
      aria-labelledby="auth-title"
    >
      <header class="text-center">
        <div
          class="echo-mark mx-auto size-14 rounded-2xl"
          aria-hidden="true"
        >
          <span />
        </div>

        <h1
          id="auth-title"
          class="mt-6 text-[28px] font-extrabold leading-[1.35] tracking-tight text-foreground"
        >
          Welcome to Echo
        </h1>

        <p class="mt-1 text-sm leading-[1.35] text-muted-foreground">
          Sign in to continue your conversations.
        </p>
      </header>

      <form
        class="mt-8 space-y-6"
        aria-label="Sign in form"
      >
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

      <footer class="mt-4 text-center">
        <a
          class="echo-auth-link"
          href="/auth"
          aria-label="Create an account"
        >
          Create an account
        </a>

        <p class="mx-auto mt-6 max-w-100 text-xs leading-[1.35] text-muted-foreground">
          Use your Echo username and password to return to your message history.
        </p>
      </footer>
    </main>
  </section>
</template>
