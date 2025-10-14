import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import {
    URL,
    fileURLToPath
} from 'url'

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@echo/shared': fileURLToPath(new URL('../shared/src/index.ts', import.meta.url))
        }
    }
})