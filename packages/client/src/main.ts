import { createApp } from 'vue'
import plugin from '@/plugins'
import router from '@/router'
import store from '@/stores'
import App from '@/App.vue'

createApp(App)
    .use(store)
    .use(router)
    .use(plugin)
    .mount('#app')