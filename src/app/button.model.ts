export class Button {

    text_color?: string
    text?: string
    bg_color?: string
    style?: number
    link?: string
    fontsize?: number
    submit?: boolean

    constructor(
      text_color?: string,
      text?: string,
      bg_color?: string,
      style?: number,
      link?: string,
      fontsize?: number,
      submit: boolean = false
    ) {
      this.text_color = text_color ?? 'rgba(255,255,255,1)'
      this.bg_color = bg_color ?? 'rgba(10,10,10,1)'
      this.style = style ?? 0
      this.text = text ?? ''
      this.link = link ?? ''
      this.fontsize = fontsize ?? 15
      this.submit = submit ?? false
    }
}