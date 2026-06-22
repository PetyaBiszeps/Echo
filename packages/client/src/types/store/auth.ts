import type {
  Ref
} from 'vue'

export interface IAuthUser {
  id: string
  username: string
  avatar?: string | null
}

export interface IAuthTokens {
  accessToken: string
  refreshToken?: string | null
}

export interface IAuthLogin {
  username: string
  password: string
}

export interface IAuthRegister {
  username: string
  password: string
}

export interface IAuthResponse {
  user: IAuthUser
  access_token: string
}

export interface IAuthConfig {
  user: Ref<IAuthUser | null>
  token: Ref<IAuthTokens | null>
  errorMessage: Ref<string | null>
}
