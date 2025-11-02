const shownMessage = (err: unknown, max = 300): string => {
    try {
        const message = JSON.stringify(err)

        return message.length > 300
            ? `${message.slice(0, max)}...` : message
    } catch {
        try {
            return String(err)
        } catch {
            return 'Unknown error'
        }
    }
}

const hasMessage = (x: unknown): x is {
    message: unknown
} => {
    return typeof x === 'object' && x !== null && 'message' in x
}

function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        return err.message || err.name
    }

    if (err === undefined || err === null) {
        return 'Unknown error'
    }

    if (typeof err === 'string') {
        return err
    }
    const msg = err as {
        response?: {
            data?: unknown
        }

        data?: unknown
    }

    const error = msg.response?.data ?? msg.data

    if (error && typeof error === 'object') {
        const response = error as {
            message?: unknown
            details?: unknown[]
            errors?: unknown[]
        }

        if (typeof response.message === 'string') {
            return response.message
        }

        if (Array.isArray(response.details) && response.details.length) {
            return response.details.map(item => {
                if (typeof item === 'string') {
                    return item
                }

                if (hasMessage(item) && typeof item.message === 'string') {
                    return item.message
                }

                return shownMessage(item)
            }).join(', ')
        }

        if (Array.isArray(response.errors) && response.errors.length) {
            return response.errors.map(item => {
                if (typeof item === 'string') {
                    return item
                }

                if (hasMessage(item) && typeof item.message === 'string') {
                    return item.message
                }

                return shownMessage(item)
            }).join(', ')
        }

        if (hasMessage(response) && typeof response.message === 'string') {
            return response.message
        }

        return shownMessage(response)
    }

    return shownMessage(err)
}

export default getErrorMessage