import useAuthStore from '@/stores/auth'
import { App } from 'vue'
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig
} from 'axios'

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $http: AxiosInstance
    }
}

interface IErrorResponse {
    message: string
}

export default {
    install (app: App) {
        const auth = useAuthStore()

        const http = axios.create({
            baseURL: '',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        })

        async function retryRequest(error: AxiosError) {
            const originalRequest = error.config as AxiosRequestConfig & {
                _retry?: boolean
            }

            if (!originalRequest._retry) {
                originalRequest._retry = true

                try {
                    await auth.refresh()

                    if (auth.tokens.accessToken) {
                        originalRequest.headers = {
                            ...originalRequest.headers,
                            Authorization: `Bearer ${auth.tokens.accessToken}`
                        }
                    }

                    return http(originalRequest)
                } catch (err) {
                    console.error(err)
                }
            }
        }

        http.interceptors.request.use((request) => {
            if (auth.tokens.accessToken) {
                request.headers = {
                    ...request.headers,
                    Authorization: `Bearer ${auth.tokens.accessToken}`
                }
            }

            return request
        }, (err: AxiosError) => {
            console.error(err)

            return Promise.reject(err)
        })

        http.interceptors.response.use((response) => response, async (error: AxiosError<IErrorResponse>) => {
            if (error.response?.status === 401) {
                return retryRequest(error)
            } else {
                const msg = error.response?.data?.message || error.message

                console.error(msg)
            }

            return Promise.reject(error)
        })

        app.config.globalProperties.$http = http
    }
}