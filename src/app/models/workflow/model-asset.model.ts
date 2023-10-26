export class ModelAsset {
  name!: string;
  id!: string;
  assetUrl?: string;
  img?: string

  constructor(
    name: string,
    id: string,
    assetUrl?: string,
    img?: string
  ) {
    this.name = name;
    this.id = id;
    this.assetUrl = assetUrl
    this.img = img
  }
}
