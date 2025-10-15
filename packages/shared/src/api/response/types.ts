export type IResponse = IErrorAPI | ISuccessAPI

export interface IErrorAPI {
    ok: false
    data: {
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