import { Dict } from 'src/app/load.service';
import { Liquid } from './liquid.model';
import { Texture } from './texture.model';

export class Ground {
  heightMap!: string;
  texture!: Texture;
  maxHeight!: number;
  minHeight!: number;
  hidden!: boolean

  constructor(
    heightMap: string,
    texture: Texture,
    maxHeight: number = 0,
    minHeight: number = 0,
    hidden: boolean = false
  ) {
    this.heightMap = heightMap;
    this.texture = texture;
    this.maxHeight = maxHeight
    this.minHeight = minHeight
    this.hidden = hidden
  }
}
