type IToastType = 'error' | 'warning' | 'success'

export interface IToast {
    type: IToastType
    message: string
}