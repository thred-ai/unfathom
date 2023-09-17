export class ModelAsset {
  texture?: string;
  name!: string;
  id!: string;
  type!: 'static' | 'movable';
  assetUrl?: string;

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    texture?: string,
    type: 'static' | 'movable' = 'static'
  ) {
    this.name = name;
    this.id = id;
    this.assetUrl = assetUrl
    this.texture = texture;
    this.type = type;
  }
}
