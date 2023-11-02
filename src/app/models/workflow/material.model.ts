import { Dict } from 'src/app/load.service';
import { Texture } from './texture.model';
import { Asset } from './asset.model';

export class Material extends Asset {
  texture!: Texture;

  constructor(
    id: string,
    name: string,
    texture: Texture = new Texture(id),
    metadata: Dict<any> = {},
    img?: string,
    thumb?: string
  ) {
    super(name, id, img, thumb, metadata);
    this.texture = texture;
  }
}
