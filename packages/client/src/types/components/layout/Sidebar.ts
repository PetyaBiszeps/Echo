export interface IUser {
    id: number
    title: string
    avatar?: string
    lastMessage: string
    isRead: boolean
    timestamp?: string
    unreadCount: number
}