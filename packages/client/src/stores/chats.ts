import getErrorMessage from '@/utils/getErrorMessage'
import useToastStore from '@/stores/toast'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import http from '@/constants/http'
import type {
    IChats
    // IMessage
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

    async function loadChats() {
        try {
            const { data } = await http.get('/chats', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`
                }
            })

            const chats: IChats[] = data.data.map((chat: IChats) => ({
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
        loadChats
    }
}, {
    persist: true
})

export default useChatStore