import type {
    IUser,
    IChat
} from '@echo/shared'

export class ChatService {
    async getChat(userId: string): Promise<IChat[]> {
        const mockUsers: IUser[] = [{
            id: '1', username: 'Alice'
        }, {
            id: '2', username: 'Nathan'
        }, {
            id: '3', username: 'Krein'
        }]

        return [{
            id: '1',
            title: 'Alice',
            participants: [{
                id: userId, username: 'current_user',
            }, mockUsers[0]],
            lastMessage: {
                id: 'msg1',
                content: 'Привет! Как дела?',
                senderId: mockUsers[0].id,
                timestamp: new Date()
            },
            unreadCount: 2,
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date()
        }, {
            id: '2',
            title: 'Nathan',
            participants: [{
                id: userId, username: 'current_user',
            }, mockUsers[1]],
            unreadCount: 0,
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date()
        }]
    }
}