import { LiquidType } from "./liquid-type.enum";
import { Texture } from "./texture.model";

export class Liquid {
  texture!: Texture;
  level!: number
  liquid?: LiquidType;

  constructor(texture: Texture, liquid?: LiquidType, level?: number) {
    this.texture = texture;
    this.liquid = liquid;
    this.level = level ?? 20
  }
}