import type { AxiosError } from 'axios'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
    IAuthUser,
    IAuthLogin,
    IAuthTokens
} from '@/types'

const useAuthStore = defineStore('auth', () => {
    const user = ref<IAuthUser | null>(null)
    const token = ref<IAuthTokens | null>(null)

    const isAuthenticated = computed(() => {
        return !!token.value && !!user.value
    })

    async function register(data: IAuthLogin) {
        try {
            const { data: result } = await http.post<{
                user: IAuthUser,
                access_token: string
            }>('/auth/register', {
                username: data.username,
                password: data.password
            })

            user.value = result.user
            token.value = {
                accessToken: result.access_token
            }
        } catch (err) {
            const error = err as AxiosError<{
                message?: string
            }>

            throw error.response?.data?.message || error.message
        }
    }

    async function login(data: IAuthLogin) {
        try {
            const { data: result } = await http.post<{
                user: IAuthUser,
                access_token: string
            }>('/auth/login', {
                username: data.username,
                password: data.password
            })

            user.value = result.user
            token.value = {
                accessToken: result.access_token
            }
        } catch (err) {
            const error = err as AxiosError<{
                message?: string
            }>

            throw error.response?.data?.message || error.message
        }
    }

    function logout() {
        user.value = null
        token.value = null
    }

    return {
        user, token, isAuthenticated,
        register, login, logout
    }
}, {
    persist: true
})

export default useAuthStore