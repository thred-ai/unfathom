import { Dict } from 'src/app/load.service';
import { Asset } from './asset.model';

export class ModelAsset extends Asset {
  assetUrl?: string;

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    img?: string,
    thumb?: string,
    metadata: Dict<any> = {}
  ) {
    super(name, id, img, thumb, metadata);

    this.assetUrl = assetUrl;
  }
}
