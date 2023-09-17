import { LiquidType } from "./liquid-type.enum";

export class Liquid {
  texture!: string;
  liquid?: LiquidType;

  constructor(texture: string, liquid?: LiquidType) {
    this.texture = texture;
    this.liquid = liquid;
  }
}