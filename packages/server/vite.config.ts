import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(fileURLToPath(new URL('.', import.meta.url)), './src'),
            '@echo/shared': path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../shared/src/index.ts')
        }
    }
})

// We are testing CI