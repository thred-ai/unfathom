export class ModelAsset {
  name!: string;
  id!: string;
  type!: 'static' | 'movable';
  assetUrl?: string;
  img?: string;

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    img?: string,
    type: 'static' | 'movable' = 'static'
  ) {
    this.name = name;
    this.id = id;
    this.assetUrl = assetUrl
    this.type = type;
    this.img = img
  }
}
