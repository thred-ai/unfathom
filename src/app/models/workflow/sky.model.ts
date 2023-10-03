import { Texture } from "./texture.model";

export class Sky {
  height!: number;
  texture!: Texture;
  hidden!: boolean

  constructor(height: number, texture: Texture, hidden: boolean = false) {
    this.height = height;
    this.texture = texture;
    this.hidden = hidden
  }
}