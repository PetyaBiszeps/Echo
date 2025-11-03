import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
    IToast
} from '@/types'

const useToastStore = defineStore('toast', () => {
    const errorMessages = ref<IToast[]>([])
    const warningMessages = ref<IToast[]>([])
    const successMessages = ref<IToast[]>([])
    const neutralMessages = ref<IToast[]>([])

    const getErrorMessages = computed(() => errorMessages.value)
    const getWarningMessages = computed(() => warningMessages.value)
    const getSuccessMessages = computed(() => successMessages.value)
    const getNeutralMessages = computed(() => neutralMessages.value)

    function addErrorMessage(msg: IToast) {
        errorMessages.value.push(msg)

        setTimeout(() => {
            const idx = errorMessages.value.indexOf(msg)

            if (idx !== -1) {
                errorMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addWarningMessage(msg: IToast) {
        warningMessages.value.push(msg)

        setTimeout(() => {
            const idx = warningMessages.value.indexOf(msg)

            if (idx !== -1) {
                warningMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addSuccessMessage(msg: IToast) {
        successMessages.value.push(msg)

        setTimeout(() => {
            const idx = successMessages.value.indexOf(msg)

            if (idx !== -1) {
                successMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addNeutralMessage(msg: IToast) {
        neutralMessages.value.push(msg)

        setTimeout(() => {
            const idx = neutralMessages.value.indexOf(msg)

            if (idx !== -1) {
                neutralMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addToaster(payload: IToast) {
        if (payload.type === 'error') {
            return addErrorMessage(payload)
        }

        if (payload.type === 'warning') {
            return addWarningMessage(payload)
        }

        if (payload.type === 'success') {
            return addSuccessMessage(payload)
        }
        return addNeutralMessage(payload)
    }

    return {
        errorMessages, getErrorMessages,
        warningMessages, getWarningMessages,
        successMessages, getSuccessMessages,
        neutralMessages, getNeutralMessages,
        addToaster
    }
})

export default useToastStore