<template>
  <div class="loginView">
    <header>
      <h1>ECHO</h1>
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