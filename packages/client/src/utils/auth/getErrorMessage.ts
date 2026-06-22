const shownMessage = (err: unknown, max = 300): string => {
  try {
    const message = JSON.stringify(err)

    return message.length > max
      ? `${message.slice(0, max)}...`
      : message
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

const getOfetchPayload = (err: unknown): unknown => {
  if (typeof err !== 'object' || err === null) {
    return null
  }

  const error = err as {
    data?: unknown
    response?: {
      _data?: unknown
      data?: unknown
    }
  }

  return error.data ?? error.response?._data ?? error.response?.data ?? null
}

const parseErrorPayload = (error: unknown): string | null => {
  if (!error || typeof error !== 'object') {
    return null
  }

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

export default (err: unknown): string => {
  const payload = getOfetchPayload(err)
  const payloadMessage = parseErrorPayload(payload)

  if (payloadMessage) {
    return payloadMessage
  }

  if (err instanceof Error) {
    return err.message || err.name
  }

  if (err === undefined || err === null) {
    return 'Unknown error'
  }

  if (typeof err === 'string') {
    return err
  }

  return shownMessage(err)
}
