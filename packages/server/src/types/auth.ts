export interface IJWTPayload {
    id: string
    username: string
    iat?: number
    exp?: number
}