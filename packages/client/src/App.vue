<template>
  <RouterView />
</template>

<style lang="scss">
@use "@/styles/main.scss" as theme;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  #app {
    font-size: 1rem;
    line-height: 1.5;
    font-family: 'JetBrains Mono', monospace;
  }
}
</style>