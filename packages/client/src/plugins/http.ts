import useAuthStore from '@/stores/auth'
import axios from 'axios'
import type {
    App
} from 'vue'

export const http = axios.create({
    baseURL: import.meta.env.VITE_APP_API_URL,
    headers: {
        'content-type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000
})

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
}