import http from '@/plugins/http'
import type {
    App,
    Plugin
} from 'vue'

const plugin: Plugin[] = [http]

export default {
    install (app: App): void {
        plugin.forEach((plugin: Plugin) => app.use(plugin))
    }
} satisfies Plugin