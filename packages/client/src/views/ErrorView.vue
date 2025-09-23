<script setup lang="ts">
import { useRouter } from 'vue-router'

  // Constants
const router = useRouter()

  // Methods
async function backToHome() {
  await router.push('/')
}
</script>

<template>
  <div class="errorView">
    <nav>
      <button @click="backToHome">
        <span>Back to Home</span>
      </button>
    </nav>
  </div>
</template>