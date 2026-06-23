import useAuthStore from '@/store/auth.ts'
import useAPI from '@/composables/useAPI.ts'
import {
  computed,
  onUnmounted,
  ref,
  watch
} from 'vue'
import type { Ref } from 'vue'
import type { IUser } from '@echo/shared'

type UserSearchResponse = {
  success: true
  data: IUser[]
}

type UseUserSearchOptions = {
  debounceMs?: number
  minLength?: number
}

export default function useUserSearch(query: Ref<string>, options: UseUserSearchOptions = {}) {
  const http = useAPI()
  const auth = useAuthStore()
  const minLength = options.minLength ?? 2
  const debounceMs = options.debounceMs ?? 250

  const results = ref<IUser[]>([])
  const isSearching = ref(false)
  const searchError = ref<string | null>(null)
  const normalizedQuery = computed(() => query.value.trim())
  const canSearch = computed(() => normalizedQuery.value.length >= minLength)

  let searchTimer: ReturnType<typeof setTimeout> | null = null
  let searchRequestId = 0

  watch(normalizedQuery, (value) => {
    clearSearchTimer()
    searchError.value = null
    searchRequestId += 1

    if (!value || value.length < minLength) {
      results.value = []
      isSearching.value = false
      return
    }

    const requestId = searchRequestId

    searchTimer = setTimeout(() => {
      void searchUsers(value, requestId)
    }, debounceMs)
  })

  onUnmounted(() => {
    clearSearchTimer()
  })

  async function searchUsers(value: string, requestId: number) {
    const accessToken = auth.token?.accessToken

    if (!accessToken) {
      results.value = []
      searchError.value = 'Sign in again to search users.'
      return
    }

    isSearching.value = true

    try {
      const response = await http.get<UserSearchResponse>('/users/search', {
        query: {
          q: value
        },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })

      if (requestId === searchRequestId) {
        results.value = response.data
        searchError.value = null
      }
    } catch {
      if (requestId === searchRequestId) {
        results.value = []
        searchError.value = 'Unable to search users. Please try again.'
      }
    } finally {
      if (requestId === searchRequestId) {
        isSearching.value = false
      }
    }
  }

  function resetUserSearch(clearQuery = false) {
    clearSearchTimer()
    searchRequestId += 1

    if (clearQuery) {
      query.value = ''
    }

    results.value = []
    isSearching.value = false
    searchError.value = null
  }

  function clearSearchTimer() {
    if (!searchTimer) {
      return
    }

    clearTimeout(searchTimer)
    searchTimer = null
  }

  return {
    normalizedQuery,
    canSearch,
    results,
    isSearching,
    searchError,
    resetUserSearch
  }
}
