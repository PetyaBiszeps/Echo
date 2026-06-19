// import getErrorMessage from '@/utils/getErrorMessage'
// import useToastStore from '@/stores/toast'
// import useChatStore from '@/stores/chats'
// import useRealtimeStore from '@/stores/realtime'

import useAPI from '@/composables/useAPI.ts'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  IAuthUser,
  IAuthLogin,
  IAuthTokens,
  IAuthRegister
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
    } catch (err: unknown) {
      return err
    }
  }

  async function login(_data: IAuthLogin) {
    return null
  }

  function logout() {
    return null
  }

  return {
    user, token, errorMessage, isAuthenticated,
    register, login, logout
  }
}, {
  persist: true
})

export default useAuthStore
