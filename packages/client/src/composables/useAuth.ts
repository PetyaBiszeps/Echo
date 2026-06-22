import useAuthStore from '@/store/auth.ts'
import { useRouter } from 'vue-router'
import {
  reactive,
  computed
} from 'vue'

export default () => {
  const router = useRouter()
  const auth = useAuthStore()

  const state = reactive({
    mode: 'login' as 'login' | 'register',
    login: {
      username: '',
      password: ''
    },
    register: {
      username: '',
      password: '',
      confirmPassword: ''
    },
    isSubmitting: false
  })
  const isRegister = computed(() => state.mode === 'register')

  const registerPasswordError = computed(() => {
    const { password, confirmPassword } = state.register

    if (!isRegister.value) {
      return null
    }

    if (password.length > 0 && password.length < 8) {
      return 'Password must be at least 8 characters.'
    }

    if (confirmPassword.length > 0 && password !== confirmPassword) {
      return 'Passwords do not match.'
    }
    return null
  })

  function setMode(mode: 'login' | 'register') {
    state.mode = mode
    auth.errorMessage = null
  }

  async function handleLogin() {
    if (state.isSubmitting) {
      return
    }
    state.isSubmitting = true

    try {
      await auth.login({
        username: state.login.username,
        password: state.login.password
      })
      await router.push('/')
    } catch {} finally {
      state.isSubmitting = false
    }
  }

  async function handleRegister() {
    if (state.isSubmitting || registerPasswordError.value) {
      return
    }
    state.isSubmitting = true

    try {
      await auth.register({
        username: state.register.username,
        password: state.register.password
      })
      await router.push('/')
    } catch {} finally {
      state.isSubmitting = false
    }
  }

  return {
    auth, state,
    registerPasswordError,
    setMode, handleRegister, handleLogin
  }
}
