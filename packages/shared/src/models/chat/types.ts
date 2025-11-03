export interface IUser {
    id: string
    username: string
    avatar?: string | null
}

export interface IChat {
    id: string
    title?: string | null
    participants: IUser[]
    lastMessage?: IMessage | null
    unreadCount: number
    createdAt: string   // ISO
    updatedAt: string   // ISO
}

export interface IMessage {
    id: string
    content: string
    senderId: string
    timestamp: string
}