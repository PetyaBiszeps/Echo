export interface IUser {
    id: string
    username: string
    email: string
    avatar?: string
    isOnline: boolean
    lastSeen: Date
    createdAt: Date
}

export interface IMessage {
    id: string
    chatId: string
    senderId: string
    content: string
    type: 'text' | 'image' | 'file'
    isRead: boolean
    createdAt: Date
    updatedAt: Date
}

export interface IChat {
    id: string
    name?: string
    type: 'direct' | 'group'
    participants: string[]
    lastMessage?: IMessage
    createdAt: Date
    updatedAt: Date
}

export interface IApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
}