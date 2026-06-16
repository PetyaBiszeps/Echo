import { fileURLToPath } from 'node:url'
import {
  defineConfig
} from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@echo/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
    }
  }
})
