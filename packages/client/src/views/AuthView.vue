<script setup lang="ts">
import useAuth from '@/composables/useAuth.ts'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Eye, User, Lock } from '@lucide/vue'
import {
  Button
} from '@/components/ui/button'

// Init
const {
  auth, state,
  registerPasswordError, hasRegisterPasswordError, registerConfirmInputClass,
  setMode, handleRegister, handleLogin
} = useAuth()
</script>

<template>
  <Transition
    name="auth-card"
    mode="out-in"
  >
    <section
      v-if="state.mode === 'login'"
      key="login"
      class="w-full max-w-115 p-6 bg-surface-auth-card border border-border rounded-3xl"
    >
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
        <form
          class="mt-8 space-y-6"
          @submit.prevent="handleLogin"
        >
          <div class="space-y-2">
            <Label
              for="username"
              class="text-xs font-bold text-muted-foreground"
            >
              Username
            </Label>

            <div class="echo-input">
              <User class="size-4 shrink-0 stroke-current" />

              <Input
                v-model="state.login.username"

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
              class="text-xs font-bold text-muted-foreground"
            >
              Password
            </Label>

            <div class="echo-input">
              <Lock class="size-4 shrink-0 stroke-current" />

              <Input
                v-model="state.login.password"

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

          <p
            v-if="auth.errorMessage"
            class="max-w-full truncate text-xs font-semibold text-destructive"
            :title="auth.errorMessage"
          >
            {{ auth.errorMessage }}
          </p>

          <Button
            type="submit"
            :disabled="state.isSubmitting"
            class="w-full h-11 rounded-xl text-sm font-extrabold"
          >
            Sign in
          </Button>
        </form>
      </main>

      <footer class="text-center mt-4">
        <button
          class="text-primary text-sm font-bold no-underline hover:underline underline-offset-4 cursor-pointer"
          type="button"
          @click="setMode('register')"
        >
          Create an account
        </button>

        <p class="text-xs text-muted-foreground mx-auto mt-6">
          Use your Echo username and password to return to your message history.
        </p>
      </footer>
    </section>

    <section
      v-else
      key="register"
      class="w-80 p-6 bg-popover border border-border rounded-3xl"
    >
      <header>
        <div class="flex items-center gap-3">
          <div class="echo-mark size-10 rounded-xl">
            <span />
          </div>

          <div>
            <h1 class="text-xl font-extrabold tracking-tight">
              Create your account
            </h1>

            <p class="text-sm text-muted-foreground mt-0.5">
              Start a quiet space.
            </p>
          </div>
        </div>
      </header>

      <main>
        <form
          class="mt-5 space-y-3"
          @submit.prevent="handleRegister"
        >
          <div class="space-y-2">
            <Label
              for="register-username"
              class="text-xs font-bold text-muted-foreground"
            >
              Username
            </Label>

            <div class="echo-input">
              <User class="size-4 shrink-0 stroke-current" />

              <Input
                v-model="state.register.username"

                id="register-username"
                name="username"
                autocomplete="username"
                placeholder="alice"
                class="h-full border-0 bg-transparent px-0 font-normal text-muted-foreground shadow-none placeholder:text-muted-foreground placeholder:font-normal focus-visible:border-0 focus-visible:ring-0"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label
              for="register-password"
              class="text-xs font-bold text-muted-foreground"
            >
              Password
            </Label>

            <div class="echo-input">
              <Lock class="size-4 shrink-0 stroke-current" />

              <Input
                v-model="state.register.password"

                id="register-password"
                name="password"
                type="password"
                autocomplete="new-password"
                placeholder="password"
                class="h-full border-0 bg-transparent px-0 font-normal text-muted-foreground shadow-none placeholder:text-muted-foreground placeholder:font-normal focus-visible:border-0 focus-visible:ring-0"
              />

              <button
                class="grid size-6 shrink-0 place-items-center text-muted-foreground"
                type="button"
              >
                <Eye class="size-4 shrink-0 stroke-current" />
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <Label
              for="register-confirm-password"
              class="text-xs font-bold"
              :class="hasRegisterPasswordError ? 'text-destructive' : 'text-muted-foreground'"
            >
              Confirm password
            </Label>

            <div
              class="echo-input"
              :aria-invalid="hasRegisterPasswordError"
            >
              <Lock class="size-4 shrink-0 stroke-current text-muted-foreground" />

              <Input
                v-model="state.register.confirmPassword"

                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                placeholder="pass"
                class="h-full border-0 bg-transparent px-0 font-normal shadow-none placeholder:font-normal focus-visible:border-0 focus-visible:ring-0"
                :class="registerConfirmInputClass"
              />

              <button
                class="grid size-6 shrink-0 place-items-center text-muted-foreground"
                type="button"
              >
                <Eye class="size-4 shrink-0 stroke-current" />
              </button>
            </div>

            <p
              v-if="registerPasswordError"
              class="text-xs font-semibold text-destructive"
            >
              {{ registerPasswordError }}
            </p>
          </div>

          <p
            v-if="auth.errorMessage"
            class="max-w-full truncate text-xs font-semibold text-destructive"
            :title="auth.errorMessage"
          >
            {{ auth.errorMessage }}
          </p>

          <Button
            type="submit"
            :disabled="state.isSubmitting || hasRegisterPasswordError"
            class="w-full h-11 rounded-xl text-sm font-extrabold"
          >
            Create account
          </Button>
        </form>
      </main>

      <footer class="text-center mt-2">
        <button
          class="text-primary text-sm font-bold no-underline hover:underline underline-offset-4 cursor-pointer"
          type="button"
          @click="setMode('login')"
        >
          Already have an account?
        </button>
      </footer>
    </section>
  </Transition>
</template>
