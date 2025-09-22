export type Register = {
    username: string
    password: string
}

export type Login = {
    username: string
    password: string
}

export type AuthResponse = {
    user: {
        id: string
        username: string
    }
    access_token: string
}