import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type {
    IToastPayload
} from '@/types'

const useToastStore = defineStore('toast', () => {
    const errorMessages = ref<IToastPayload[]>([])
    const warningMessages = ref<IToastPayload[]>([])
    const successMessages = ref<IToastPayload[]>([])
    const neutralMessages = ref<IToastPayload[]>([])

    const getErrorMessages = computed(() => errorMessages.value)
    const getWarningMessages = computed(() => warningMessages.value)
    const getSuccessMessages = computed(() => successMessages.value)
    const getNeutralMessages = computed(() => neutralMessages.value)

    function addErrorMessage(msg: IToastPayload) {
        errorMessages.value.push(msg)

        setTimeout(() => {
            const idx = errorMessages.value.indexOf(msg)

            if (idx !== -1) {
                errorMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addWarningMessage(msg: IToastPayload) {
        warningMessages.value.push(msg)

        setTimeout(() => {
            const idx = warningMessages.value.indexOf(msg)

            if (idx !== -1) {
                warningMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addSuccessMessage(msg: IToastPayload) {
        successMessages.value.push(msg)

        setTimeout(() => {
            const idx = successMessages.value.indexOf(msg)

            if (idx !== -1) {
                successMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addNeutralMessage(msg: IToastPayload) {
        neutralMessages.value.push(msg)

        setTimeout(() => {
            const idx = neutralMessages.value.indexOf(msg)

            if (idx !== -1) {
                neutralMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function hideErrorMessage(index: number) {
        errorMessages.value.splice(index, 1)
    }

    function hideWarningMessage(index: number) {
        warningMessages.value.splice(index, 1)
    }

    function hideSuccessMessage(index: number) {
        successMessages.value.splice(index, 1)
    }

    function hideNeutralMessage(index: number) {
        neutralMessages.value.splice(index, 1)
    }

    function addToaster(payload: IToastPayload) {
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

    function clearToaster() {
        errorMessages.value = []
        warningMessages.value = []
        successMessages.value = []
    }

    return {
        errorMessages, getErrorMessages, addErrorMessage, hideErrorMessage,
        warningMessages, getWarningMessages, addWarningMessage, hideWarningMessage,
        successMessages, getSuccessMessages, addSuccessMessage, hideSuccessMessage,
        neutralMessages, getNeutralMessages, addNeutralMessage, hideNeutralMessage,
        addToaster, clearToaster
    }
})

export default useToastStore