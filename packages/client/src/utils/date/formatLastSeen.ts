export function formatLastSeen(value: string) {
  const date = new Date(value)
  const timestamp = date.getTime()

  if (Number.isNaN(timestamp)) {
    return 'recently'
  }

  const now = new Date()
  const diffMs = now.getTime() - timestamp
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) {
    return 'just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return `${diffHours}h ago`
  }

  const yesterday = new Date(now)

  yesterday.setDate(now.getDate() - 1)

  if (date.toDateString() === yesterday.toDateString()) {
    return 'yesterday'
  }

  return new Intl.DateTimeFormat(undefined, date.getFullYear() === now.getFullYear()
    ? {
      month: 'short',
      day: 'numeric'
    }
    : {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
}
