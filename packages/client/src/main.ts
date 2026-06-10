import { createApp } from 'vue'
import plugin from '@/plugins'
import router from '@/router'
import store from '@/stores'
import useRealtimeStore from '@/stores/realtime'
import useChatStore from '@/stores/chats'
import useAuthStore from '@/stores/auth'
import {
  watch
} from 'vue'
import App from '@/App.vue'
import '@/styles/main.scss'

const app = createApp(App)

app.use(store)

app.use(router)

const authStore = useAuthStore()
const chatStore = useChatStore()
const realtimeStore = useRealtimeStore()

realtimeStore.setMessageHandler(chatStore.receiveMessage)
realtimeStore.setChatUpdatedHandler(chatStore.receiveChatUpdate)

if (authStore.token?.accessToken) {
  realtimeStore.connect(authStore.token.accessToken)
}

watch(() => authStore.isAuthenticated, (isAuthenticated) => {
  if (!isAuthenticated && router.currentRoute.value.meta.requiresAuth) {
    void router.replace({
      name: 'auth'
    })
  }
})

app
  .use(plugin)
  .mount('#app')
