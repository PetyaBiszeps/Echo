export type IResponse = IErrorAPI | ISuccessAPI

export interface IErrorAPI<T = unknown> {
    ok: false
    data: IPayloadAPI<T>
}

export interface ISuccessAPI<T = unknown> {
    ok: true
    data: IPayloadAPI<T>
}

export interface IPayloadAPI<T = unknown> {
    code: string
    message: string
    details?: T
}