<script setup lang="ts">
import BaseInput from "@/components/ui/base/BaseInput.vue"
import { ref } from "vue";

const input = ref({
  username: '',
  password: ''
})
</script>

<template>
  <div class="loginView">
    <header>
      <h1>ECHO</h1>
    </header>

    <main>
      <BaseInput
          v-model="input.username"

          :id="'username'"
          :name="'username'"
          :type="'text'"
          :placeholder="'testing'"
          :disabled="false"
          :readonly="false"
          :autocomplete="'username'"
      />
    </main>
  </div>
</template>

<style scoped lang="scss">
.loginView {
  display: flex;
  place-items: center;
  flex-direction: column;

  main {
    gap: 1rem;
    display: flex;
    flex-direction: column;
  }
}
</style>