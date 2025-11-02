import type {
    IUser
} from '@/types'

export interface IChats {
    id: number
    title: string
    participants: IUser[]
    lastMessage?: IMessage
    unreadCount: number
    createdAt: Date
    updatedAt: Date
}

export interface IMessage {
    id: string
    content: string
    senderId: number
    timestamp: Date
}