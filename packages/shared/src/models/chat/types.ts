export interface IUser {
    id: string
    username: string
    avatar?: string
}

export interface IChat {
    id: string
    title: string
    participants: IUser[]
    lastMessage?: {
        id: string
        content: string
        senderId: string
        timestamp: Date
    }
    unreadCount?: number
    createdAt: Date
    updatedAt: Date
}