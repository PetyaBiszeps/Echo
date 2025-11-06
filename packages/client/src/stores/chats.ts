import getErrorMessage from '@/utils/getErrorMessage'
import useToastStore from '@/stores/toast'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
    IChat
} from '@echo/shared'

const useChatStore = defineStore('chats', () => {
    const toaster = useToastStore()
    const chatList = ref<IChat[]>([])
    const selectedChatId = ref<string | null>(null)

    const getChat = computed(() => {
        return chatList.value.find(chat => chat.id === selectedChatId.value) ?? null
    })

    function selectChat(chatId: string) {
        selectedChatId.value = chatId
    }

    function setChat(newChatList: IChat[]) {
        chatList.value = newChatList
    }

    async function loadChats() {
        try {
            const { data } = await http.get('/chats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            const chats: IChat[] = data.data.map((chat: IChat) => ({
                ...chat,
                createdAt: new Date(chat.createdAt).toISOString(),
                updatedAt: new Date(chat.updatedAt).toISOString(),
                lastMessage: chat.lastMessage
                    ? {
                        ...chat.lastMessage,
                        timestamp: new Date(chat.lastMessage.timestamp).toISOString()
                    } : undefined
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
        loadChats
    }
}, {
    persist: true
})

export default useChatStore