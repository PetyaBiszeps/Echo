import getErrorMessage from '@/utils/getErrorMessage.ts'
import useAPI from '@/composables/useAPI.ts'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  IAuthUser,
  IAuthLogin,
  IAuthTokens,
  IAuthRegister,
  IAuthResponse
} from '@/types'

const useAuthStore = defineStore('auth', () => {
  const http = useAPI()

  const user = ref<IAuthUser | null>(null)
  const token = ref<IAuthTokens | null>(null)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => {
    return Boolean(token.value) && Boolean(user.value)
  })

  async function register(data: IAuthRegister) {
    try {
      errorMessage.value = null

      const result = await http.post<IAuthResponse>('/auth/register', {
        body: {
          username: data.username,
          password: data.password
        }
      })
      user.value = result.user
      token.value = {
        accessToken: result.access_token
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err)

      errorMessage.value = message

      throw new Error(message, {
        cause: err
      })
    }
  }

  async function login(data: IAuthLogin) {
    try {
      errorMessage.value = null

      const result = await http.post<IAuthResponse>('/auth/login', {
        body: {
          username: data.username,
          password: data.password
        }
      })
      user.value = result.user
      token.value = {
        accessToken: result.access_token
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err)

      errorMessage.value = message

      throw new Error(message, {
        cause: err
      })
    }
  }

  function logout() {
    user.value = null
    token.value = null
    errorMessage.value = null
  }

  return {
    user, token, errorMessage, isAuthenticated,
    register, login, logout
  }
}, {
  persist: true
})

export default useAuthStore
