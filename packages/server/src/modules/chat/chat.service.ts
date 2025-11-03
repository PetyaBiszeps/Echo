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
        }, {
            id: '4', username: 'Kan'
        }, {
            id: '5', username: 'John'
        }]

        return [{
            id: '1',
            title: 'Alice',
            participants: [{
                id: userId, username: 'current_user'
            }, mockUsers[0]],
            lastMessage: {
                id: 'msg1',
                content: 'Привет! Как дела?',
                senderId: mockUsers[0].id,
                timestamp: new Date().toISOString()
            },
            unreadCount: 2,
            createdAt: new Date('2024-01-01').toISOString(),
            updatedAt: new Date().toISOString()
        }, {
            id: '2',
            title: 'Nathan',
            participants: [{
                id: userId, username: 'current_user'
            }, mockUsers[1]],
            unreadCount: 0,
            createdAt: new Date('2024-01-02').toISOString(),
            updatedAt: new Date().toISOString()
        }, {
            id: '3',
            title: 'Kan',
            participants: [{
                id: userId, username: 'current_user'
            }, mockUsers[2]],
            unreadCount: 4,
            createdAt: new Date('2025-05-02').toISOString(),
            updatedAt: new Date().toISOString()
        }, {
            id: '4',
            title: 'John',
            participants: [{
                id: userId, username: 'current_user'
            }, mockUsers[2]],
            unreadCount: 4,
            createdAt: new Date('2023-12-12').toISOString(),
            updatedAt: new Date().toISOString()
        }]
    }
}