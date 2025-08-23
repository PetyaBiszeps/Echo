export const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-EN', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

export const generateId = (): string => {
    return Math.random()
        .toString(36).substring(2) + Date.now().toString(36)
}