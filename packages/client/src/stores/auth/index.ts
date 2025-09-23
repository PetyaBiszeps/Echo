import type { IAuthUser, IAuthLogin, IAuthTokens } from '@/stores/auth/types'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'

const useAuthStore = defineStore('auth', () => {
    const user = ref<IAuthUser | null>(null)
    const token = ref<IAuthTokens | null>(null)

    const isLoggedIn = computed(() => {
        return !!user.value
    })

    async function register(data: IAuthLogin) {
        try {
            const response = await axios.post<{
                user: IAuthUser,
                access_token: string
            }>(`${import.meta.env.VITE_APP_API_URL}/auth/register`, {
                username: data.username,
                password: data.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            user.value = response.data.user
            token.value = {
                accessToken: response.data.access_token
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
            const response = await axios.post<{
                user: IAuthUser,
                access_token: string
            }>(`${import.meta.env.VITE_APP_API_URL}/auth/login`, {
                username: data.username,
                password: data.password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            user.value = response.data.user
            token.value = {
                accessToken: response.data.access_token
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
        user, token, isLoggedIn,
        register, login, logout
    }
})

export default useAuthStore