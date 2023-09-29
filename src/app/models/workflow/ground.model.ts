import { Dict } from 'src/app/load.service';
import { Liquid } from './liquid.model';
import { Texture } from './texture.model';

export class Ground {
  heightMap!: string;
  texture!: Texture;
  liquid!: Dict<Liquid>
  maxHeight!: number;
  minHeight!: number;

  constructor(
    heightMap: string,
    texture: Texture,
    liquid: Dict<Liquid> = {},
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
