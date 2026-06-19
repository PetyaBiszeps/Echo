// import useAPI from '@/composables/useAPI.ts'
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
  IAuthUser,
  IAuthLogin,
  IAuthTokens,
  IAuthRegister
} from '@/types'

const useAuthStore = defineStore('auth', () => {
  // const http = useAPI()

  const user = ref<IAuthUser | null>(null)
  const token = ref<IAuthTokens | null>(null)
  const errorMessage = ref<string | null>(null)

  const isAuthenticated = computed(() => {
    return Boolean(token.value) && Boolean(user.value)
  })

  async function register(_data: IAuthRegister) {
    return null
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
