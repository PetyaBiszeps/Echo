import { createApp } from 'vue'
import plugin from '@/plugins'
import router from '@/router'
import store from '@/stores'
import App from '@/App.vue'
import '@/styles/main.scss'

createApp(App)
    .use(store)
    .use(router)
    .use(plugin)
    .mount('#app')