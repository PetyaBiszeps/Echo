import getAuthUtils from '@/utils/auth/getAuthUtils.ts'
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

  const utils = getAuthUtils({
    user: user,
    token: token,
    errorMessage: errorMessage
  })
  const isAuthenticated = computed(() => Boolean(token.value) && Boolean(user.value))

  async function register(data: IAuthRegister) {
    errorMessage.value = null

    const [res, err] = await utils.getTryCatch(http.post<IAuthResponse>('/auth/register', {
      body: {
        username: data.username,
        password: data.password
      }
    }))

    if (!res || err) {
      return utils.setAuthError(err)
    }
    utils.setAuthState(res)
  }

  async function login(data: IAuthLogin) {
    errorMessage.value = null

    const [res, err] = await utils.getTryCatch(http.post<IAuthResponse>('/auth/login', {
      body: {
        username: data.username,
        password: data.password
      }
    }))

    if (!res || err) {
      return utils.setAuthError(err)
    }
    utils.setAuthState(res)
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
