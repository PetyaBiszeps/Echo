export type IResponse = IErrorAPI | ISuccessAPI

export interface IErrorAPI<T = unknown> {
    success: false
    data: IPayloadAPI<T>
}

export interface ISuccessAPI<T = unknown> {
    success: true
    data: IPayloadAPI<T>
}

export interface IPayloadAPI<T = unknown> {
    code: string
    message: string
    details?: T | null
}