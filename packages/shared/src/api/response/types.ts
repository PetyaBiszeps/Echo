export interface IErrorAPI {
    ok: false
    error: {
        code: string
        message: string
        details?: unknown
    }
}

export interface ISuccessAPI {
    ok: true
    data: {
        code: string
        message: string
        details?: unknown
    }
}