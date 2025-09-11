export interface IBaseInput {
    id: string
    name: string
    type?: 'text' | 'number' | 'submit' | 'button'
    placeholder: string
    disabled?: boolean
    readonly?: boolean
    autocomplete?: string
}

export interface IBaseButton {
    name: string
    type?: 'button' | 'reset' | 'submit'
    disabled?: boolean
}