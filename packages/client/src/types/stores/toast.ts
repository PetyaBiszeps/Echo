export interface IToastMessage {
    id: string
    icon: string
    message: string
    variant: 'error' | 'warning' | 'success'
    duration: number
}