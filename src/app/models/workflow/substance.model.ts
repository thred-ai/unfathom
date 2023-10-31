import { Dict } from 'src/app/load.service';
import { Texture } from './texture.model';
import { Asset } from './asset.model';

export class Substance extends Asset {
  texture!: Texture;

  constructor(
    id: string,
    name: string,
    texture: Texture = new Texture(id),
    metadata: Dict<any> = {},
    img?: string
  ) {
    super(name, id, img, metadata);

    this.texture = texture;
  }
}
