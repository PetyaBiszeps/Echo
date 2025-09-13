<script setup lang="ts">
import BaseButton from '@/components/ui/base/BaseButton.vue'
import BaseInput from '@/components/ui/base/BaseInput.vue'
import { ref } from 'vue'

  // Constants
const input = ref({
  username: '',
  password: ''
})

  // Methods
function onSubmit() {
  return null
}
</script>

<template>
  <div class="loginView">
    <form @submit.prevent="onSubmit">
      <header>
        <h1>ECHO</h1>
      </header>

      <main>
        <BaseInput
          v-model="input.username"

          :id="'username'"
          :name="'username'"
          :type="'text'"
          :placeholder="'enter username...'"
          :autocomplete="'username'"
        />

        <BaseInput
          v-model="input.password"

          :id="'password'"
          :name="'password'"
          :type="'password'"
          :placeholder="'enter password...'"
          :autocomplete="'current-password'"
        />

        <BaseButton
          :name="'Login'"
          :type="'submit'"
        />
      </main>
    </form>
  </div>
</template>