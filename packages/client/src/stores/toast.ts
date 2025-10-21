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

    function addErrorMessage(msg: string) {
        errorMessages.value.push(msg)

        setTimeout(() => {
            const idx = errorMessages.value.indexOf(msg)

            if (idx !== -1) {
                errorMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addWarningMessage(msg) {
        warningMessages.value.push(msg)

        setTimeout(() => {
            const idx = warningMessages.value.indexOf(msg)

            if (idx !== -1) {
                warningMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addSuccessMessage(msg) {
        successMessages.value.push(msg)

        setTimeout(() => {
            const idx = successMessages.value.indexOf(msg)

            if (idx !== -1) {
                successMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function addNeutralMessage(msg) {
        neutralMessages.value.push(msg)

        setTimeout(() => {
            const idx = neutralMessages.value.indexOf(msg)

            if (idx !== -1) {
                neutralMessages.value.splice(idx, 1)
            }
        }, 6000)
    }

    function hideErrorMessage(index) {
        errorMessages.value.splice(index, 1)
    }

    function hideWarningMessage(index) {
        warningMessages.value.splice(index, 1)
    }

    function hideSuccessMessage(index) {
        successMessages.value.splice(index, 1)
    }

    function hideNeutralMessage(index) {
        neutralMessages.value.splice(index, 1)
    }

    function addToaster({ type, message }) {
        const payload = { type, message }

        if (type === 'error') {
            return addErrorMessage(payload)
        }

        if (type === 'warning') {
            return addWarningMessage(payload)
        }

        if (type === 'success') {
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