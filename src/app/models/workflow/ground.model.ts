import { Liquid } from './liquid.model';

export class Ground {
  heightMap!: string;
  texture!: string;
  liquid?: Liquid;
  maxHeight!: number;
  minHeight!: number;

  constructor(
    heightMap: string,
    texture: string,
    liquid?: Liquid,
    maxHeight: number = 0,
    minHeight: number = 0,
  ) {
    this.heightMap = heightMap;
    this.texture = texture;
    this.liquid = liquid;
    this.maxHeight = maxHeight
    this.minHeight = minHeight
  }
}
