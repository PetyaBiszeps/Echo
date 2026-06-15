export interface IUser {
  id: string
  username: string
  avatar?: string | null
}

export interface IChat {
  id: string
  title?: string | null
  name?: string | null
  participants: IUser[]
  lastMessage?: IMessage | null
  latestMessage?: IMessage | null
  unreadCount: number
  createdAt: string   // ISO
  updatedAt: string   // ISO
}

export interface IMessage {
  id: string
  chatId?: string
  content: string
  senderId: string
  isReadByPeer?: boolean
  createdAt?: string
  timestamp: string
}
