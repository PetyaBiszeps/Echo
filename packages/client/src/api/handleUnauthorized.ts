import useAuthStore from '@/store/auth.ts'
import router from '@/router/router.ts'

let isHandlingUnauthorized = false

export default async function handleUnauthorized() {
  if (isHandlingUnauthorized) {
    return
  }

  isHandlingUnauthorized = true

  try {
    const auth = useAuthStore()

    auth.logout()

    if (router.currentRoute.value.name !== 'auth') {
      await router.push({
        name: 'auth'
      })
    }
  } catch {
    // Unauthorized handling is best-effort; keep the original request rejection intact.
  } finally {
    isHandlingUnauthorized = false
  }
}
