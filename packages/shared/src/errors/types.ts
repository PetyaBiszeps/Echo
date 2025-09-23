export type ErrorAPI = {
    ok: false
    error: {
        code: string
        msg: string
        details?: unknown
    }
}