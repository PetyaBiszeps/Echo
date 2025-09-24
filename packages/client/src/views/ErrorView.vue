<script setup lang="ts">
import BaseButton from '@/components/ui/base/BaseButton.vue'
import { useRouter } from 'vue-router'

  // Constants
const router = useRouter()

  // Methods
async function backToHome() {
  await router.push('/')
}
</script>

<template>
  <nav :class="['errorView']">
    <header>
      <div :class="['icon']">
        <div :class="['bar']" />
        <div :class="['bar']" />
        <div :class="['bar']" />
        <div :class="['bar']" />
      </div>
    </header>

    <main>
      <h1>
        <i />
        <span>404</span>
      </h1>

      <p>Page you were looking for does not exists.</p>
    </main>

    <footer>
      <BaseButton
        :name="'Back to Home'"
        @click="backToHome"
      />
    </footer>
  </nav>
</template>