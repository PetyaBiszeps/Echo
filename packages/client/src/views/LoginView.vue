<script setup lang="ts">

</script>

<template>
  <div class="loginView">
    <header>
      <img src="@/assets/icons/logo.svg" alt="logo">
    </header>

    <main>
      <label for="login">
        <input id="login" type="text">
      </label>

      <label for="password">
        <input id="password" type="text">
      </label>
    </main>
  </div>
</template>

<style scoped lang="scss">
@use "@/styles/main.scss" as theme;

.loginView {
  header {

  }

  main {
    gap: 1rem;
    display: flex;
    flex-direction: column;
  }
}
</style>