<script setup lang="ts">
import BaseInput from "@/components/ui/base/BaseInput.vue"
</script>

<template>
  <div class="loginView">
    <header>
      <h1>ECHO</h1>
    </header>

    <main>
      <BaseInput />
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