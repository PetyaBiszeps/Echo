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
    <header>
      <h1>ECHO</h1>
    </header>

    <main>
      <form @submit.prevent="onSubmit">
        <BaseInput
          v-model="input.username"

          :id="'username'"
          :name="'username'"
          :type="'text'"
          :placeholder="'enter username...'"
          :disabled="false"
          :readonly="false"
          :autocomplete="'username'"
        />

        <BaseInput
          v-model="input.password"

          :id="'password'"
          :name="'password'"
          :type="'password'"
          :placeholder="'enter password...'"
          :disabled="false"
          :readonly="false"
          :autocomplete="'current-password'"
        />

        <BaseButton
          :name="'Login'"
          :type="'submit'"
          :disabled="false"
        />
      </form>
    </main>
  </div>
</template>

<style scoped lang="scss">
.loginView {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  place-content: center;
  flex-direction: column;

  header {
    h1 {
      text-align: center;
    }
  }

  main {
    form {
      gap: 1rem;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>