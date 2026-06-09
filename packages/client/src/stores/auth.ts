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
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => {
    return Boolean(token.value) && Boolean(user.value)
  })

  async function register(data: IAuthRegister) {
    try {
      errorMessage.value = null
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
      const message = getErrorMessage(err)

      errorMessage.value = message
      toaster.addToaster({
        type: 'error',
        message
      })

      throw new Error(message, {
        cause: err
      })
    }
  }

  async function login(data: IAuthLogin) {
    try {
      errorMessage.value = null
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
      const message = getErrorMessage(err)

      errorMessage.value = message
      toaster.addToaster({
        type: 'error',
        message
      })

      throw new Error(message, {
        cause: err
      })
    }
  }

  function logout(showToast = true) {
    user.value = null
    token.value = null
    errorMessage.value = null

    if (showToast) {
      toaster.addToaster({
        type: 'success',
        message: 'Logged out successfully'
      })
    }
  }

  return {
    user, token, errorMessage, isAuthenticated,
    register, login, logout
  }
}, {
  persist: true
})

export default useAuthStore
