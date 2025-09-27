import useAuthStore from '@/stores/auth'
import http from '@/constants/http'
import type {
    App,
    Plugin
} from 'vue'

export default {
    install(app: App) {
        const auth = useAuthStore()

        http.interceptors.request.use((config) => {
            const access = auth.token?.accessToken

            if (access) {
                config.headers.Authorization = `Bearer ${access}`
            }
            return config
        })

        http.interceptors.response.use((res) => res, async (err) => {
            const status = err.response?.status

            if (status === 401) {
                auth.logout()
            }
            const msg = err.response?.data.message || err.message || 'Request failed'

            return Promise.reject(msg)
        })

        app.config.globalProperties.$http = http
    }
} satisfies Plugin