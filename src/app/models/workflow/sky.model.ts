import { Texture } from "./texture.model";

export class Sky {
  height!: number;
  texture!: Texture;

  constructor(height: number, texture: Texture) {
    this.height = height;
    this.texture = texture;
  }
}