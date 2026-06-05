import type { IUser } from '../chat/index.js'

export interface IRegister {
  username: string
  password: string
}

export interface ILogin {
  username: string
  password: string
}

export interface IAuthResponse {
  user: IUser
  access_token: string
}
