export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REGISTER: '/api/auth/register'
    },
    USERS: {
        LIST: '/api/users',
        ME: '/api/users/me'
    },
    CHATS: {
        LIST: '/api/chats',
        CREATE: '/api/chats',
        MESSAGES: (chatId: string) => `/api/chats/${chatId}/messages`
    }
} as const

export const SOCKET_EVENTS = {
    CONNECTION: 'connection',
    DISCONNECT: 'disconnect',
    JOIN_CHAT: 'join_chat',
    LEAVE_CHAT: 'leave_chat',
    NEW_MESSAGE: 'new_message',
    MESSAGE_READ: 'message_read',
    USER_ONLINE: 'user_online',
    USER_OFFLINE: 'user_offline'
} as const