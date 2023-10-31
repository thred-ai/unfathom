import { Dict } from 'src/app/load.service';
import { Asset } from './asset.model';

export class ModelAsset extends Asset {
  assetUrl?: string;

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    img?: string,
    metadata: Dict<any> = {}
  ) {
    super(name, id, img, metadata);

    this.assetUrl = assetUrl;
  }
}
