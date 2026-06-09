<script setup lang="ts">
import InputComponent from '@/components/ui/InputComponent.vue'
import BaseButton from '@/components/ui/base/BaseButton.vue'
import useAuthStore from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref } from 'vue'

// Init
const router = useRouter()
const auth = useAuthStore()

// Constants
const input = ref({
  username: '',
  password: ''
})

// Methods
async function handleRegister() {
  try {
    await auth.register(input.value)

    await router.push({
      name: 'inbox'
    })
  } catch {
    // Store already exposes and toasts the error.
  }
}

async function handleLogin() {
  try {
    await auth.login(input.value)

    await router.push({
      name: 'inbox'
    })
  } catch {
    // Store already exposes and toasts the error.
  }
}
</script>

<template>
  <form
    :class="['loginView']"
    @submit.prevent
  >
    <header>
      <h1>ECHO</h1>
    </header>

    <main>
      <InputComponent
        v-model="input.username"

        :id="'username'"
        :name="'username'"
        :type="'text'"
        :placeholder="'enter username...'"
        :autocomplete="'username'"
      />

      <InputComponent
        v-model="input.password"

        :id="'password'"
        :name="'password'"
        :type="'password'"
        :placeholder="'enter password...'"
        :autocomplete="'current-password'"
      />

      <p v-if="auth.errorMessage">
        {{ auth.errorMessage }}
      </p>
    </main>

    <footer>
      <BaseButton
        :name="'Login'"
        :type="'submit'"

        @click="handleLogin"
      />

      <p>OR</p>

      <BaseButton
        :name="'Register'"
        :type="'submit'"

        @click="handleRegister"
      />
    </footer>
  </form>
</template>
