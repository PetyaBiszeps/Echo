import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
    resolve: {
        alias: {
            '@echo/shared': path.resolve(__dirname, '../shared/src'),
            '@echo/server': path.resolve(__dirname, './src')
        }
    }
})