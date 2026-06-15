type IToastType = 'error' | 'warning' | 'success' | 'neutral'

export interface IToast {
  type: IToastType
  message: string
  title?: string
  onClick?: () => void
}
