import getErrorMessage from '@/utils/getErrorMessage'
import useToastStore from '@/stores/toast'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
    IChats,
    IMessage
} from '@/types'

const useChatStore = defineStore('chats', () => {
    const toaster = useToastStore()
    const chatList = ref<IChats[]>([])
    const selectedChatId = ref<number | null>(null)

    const getChat = computed(() => {
        return chatList.value.find(chat => chat.id === selectedChatId.value) ?? null
    })

    function setChat(newChatList: IChats[]) {
        chatList.value = newChatList
    }

    function selectChat(chatId: number) {
        selectedChatId.value = chatId
    }

    function addMessage(chatId: number, message: IMessage) {
        const chat = chatList.value.find(chat => chat.id === chatId)

        if (!chat) {
            return
        }
        chat.lastMessage = message
        chat.updatedAt = new Date()
        chat.unreadCount = (chat.unreadCount ?? 0) + 1
    }

    function markChatAsRead(chatId: number) {
        const chat = chatList.value.find(chat => chat.id === chatId)

        if (!chat) {
            return
        }
        chat.unreadCount = 0
    }

    async function loadChats() {
        try {
            const { data } = await http.get('/chats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            const chats: IChats[] = data.data.map((chat: any) => ({
                ...chat,
                createdAt: new Date(chat.createdAt),
                updatedAt: new Date(chat.updatedAt),
                lastMessage: chat.lastMessage
                    ? { ...chat.lastMessage, timestamp: new Date(chat.lastMessage.timestamp) }
                    : undefined
            }))

            setChat(chats)
        } catch (err: unknown) {
            toaster.addToaster({
                type: 'error',
                message: getErrorMessage(err)
            })
        }
    }

    return {
        chatList,
        selectedChatId,
        getChat,
        setChat,
        selectChat,
        addMessage,
        markChatAsRead,
        loadChats
    }
}, {
    persist: true
})

export default useChatStore