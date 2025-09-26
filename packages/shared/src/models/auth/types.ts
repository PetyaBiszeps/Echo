import type { IUser } from '@/models/chat'

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