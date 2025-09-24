import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { createPinia } from 'pinia'

const store = createPinia()
    .use(piniaPluginPersistedState)

export default store