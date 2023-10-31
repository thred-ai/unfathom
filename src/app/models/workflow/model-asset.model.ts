import { Dict } from 'src/app/load.service';

export class ModelAsset {
  [x: string]: any;
  name!: string;
  id!: string;
  assetUrl?: string;
  img?: string;
  metadata: Dict<any> = {};

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    img?: string,
    metadata: Dict<any> = {}
  ) {
    this.name = name;
    this.id = id;
    this.assetUrl = assetUrl;
    this.img = img;
    this.metadata = metadata;
  }
}
