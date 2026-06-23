import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import {
  URL,
  fileURLToPath
} from 'url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        const source = `${warning.id ?? ''} ${warning.message}`

        if (warning.code === 'INVALID_ANNOTATION' && source.includes('@vueuse/core')) {
          return
        }

        warn(warning)
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@echo/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
    }
  }
})
