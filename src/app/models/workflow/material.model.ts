import { Dict } from 'src/app/load.service';
import { Texture } from './texture.model';

export class Material {
  id!: string;
  name!: string;
  texture!: Texture;
  metadata: Dict<any> = {};
  customClass?: string

  constructor(
    id: string,
    name: string,
    texture: Texture = new Texture(id),
    metadata: Dict<any> = {},
    customClass?: string
  ) {
    this.id = id;
    this.name = name;
    this.texture = texture;
    this.metadata = metadata;
    this.customClass = customClass
  }
}
