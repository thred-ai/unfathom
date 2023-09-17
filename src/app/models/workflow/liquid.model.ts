import { LiquidType } from "./liquid-type.enum";

export class Liquid {
  texture!: string;
  level!: number
  liquid?: LiquidType;

  constructor(texture: string, liquid?: LiquidType, level?: number) {
    this.texture = texture;
    this.liquid = liquid;
    this.level = level ?? 20
  }
}