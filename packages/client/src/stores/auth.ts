import getErrorMessage from '@/utils/getErrorMessage'
import useToastStore from '@/stores/toast'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
    IAuthUser,
    IAuthLogin,
    IAuthTokens,
    IAuthRegister
} from '@/types'

const useAuthStore = defineStore('auth', () => {
    const toaster = useToastStore()

    const user = ref<IAuthUser | null>(null)
    const token = ref<IAuthTokens | null>(null)

    const isAuthenticated = computed(() => {
        return !!token.value && !!user.value
    })

    async function register(data: IAuthRegister) {
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

            toaster.addToaster({
                type: 'success',
                message: 'Register successfully'
            })
        } catch (err: unknown) {
            toaster.addToaster({
                type: 'error',
                message: getErrorMessage(err)
            })
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

            toaster.addToaster({
                type: 'success',
                message: 'Logged in successfully'
            })
        } catch (err: unknown) {
            toaster.addToaster({
                type: 'error',
                message: getErrorMessage(err)
            })
        }
    }

    function logout() {
        user.value = null
        token.value = null

        toaster.addToaster({
            type: 'success',
            message: 'Logged out successfully'
        })
    }

    return {
        user, token, isAuthenticated,
        register, login, logout
    }
}, {
    persist: true
})

export default useAuthStore