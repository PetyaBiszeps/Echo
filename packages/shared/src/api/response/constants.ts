export const ErrorCodes = {
    CONFLICT: 'CONFLICT',
    BAD_REQUEST: 'BAD_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
} as const

export const ErrorMessages = {
    CONFLICT: 'Conflict',
    BAD_REQUEST: 'Bad Request',
    UNAUTHORIZED: 'Unauthorized',
    VALIDATION_ERROR: 'Validation Error',
    UNPROCESSABLE_ENTITY: 'Unprocessable Entity',
    INTERNAL_SERVER_ERROR: 'Internal Server Error'
} as const