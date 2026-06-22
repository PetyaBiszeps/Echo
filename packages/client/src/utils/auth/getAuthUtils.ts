import getErrorMessage from '@/utils/auth/getErrorMessage.ts'
import getTryCatch from '@/utils/auth/getTryCatch.ts'
import type {
  IAuthConfig,
  IAuthResponse
} from '@/types'

export default (config: IAuthConfig) => {
  const {
    user,
    token,
    errorMessage
  } = config

  const setAuthState = (res: IAuthResponse) => {
    token.value = {
      accessToken: res.access_token
    }
    user.value = res.user
  }

  const setAuthError = (err: unknown) => {
    const message = getErrorMessage(err)

    errorMessage.value = message

    throw new Error(message, {
      cause: err
    })
  }

  return {
    getTryCatch, getErrorMessage,
    setAuthState, setAuthError
  }
}
