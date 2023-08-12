export class Bar {
  backgroundColor: string;
  detailColor: string;
  textColor: string;
  visible: boolean;
  font: string;
  mode: number;
  content?: string;
  corners: number;

  constructor(
    backgroundColor?: string,
    detailColor?: string,
    textColor?: string,
    corners?: number,
    visible?: boolean,
    font?: string,
    content?: string,
    mode?: number
  ) {
    this.backgroundColor = backgroundColor ?? '#FFFFFF';
    this.corners = corners ?? 0;
    this.detailColor = detailColor ?? '#000000';
    this.textColor = textColor ?? '#000000';
    this.visible = visible ?? false;
    this.font = font ?? 'Montserrat';
    this.mode = mode ?? 0;
    this.content = content;
  }
}
