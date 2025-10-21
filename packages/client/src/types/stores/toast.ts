type IToastType = 'error' | 'warning' | 'success'

export interface IToastPayload {
    type: IToastType
    message: string
}

export interface IToast extends IToastPayload {
    id: number
}