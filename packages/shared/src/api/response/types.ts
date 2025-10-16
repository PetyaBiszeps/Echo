export type IResponse = IErrorAPI | ISuccessAPI

export interface IErrorAPI<T = unknown> {
    ok: false
    status: number
    data: IPayloadAPI<T>
}

export interface ISuccessAPI<T = unknown> {
    ok: true
    status: number
    data: IPayloadAPI<T>
}

export interface IPayloadAPI<T = unknown> {
    code: string
    message: string
    details?: T | null
}