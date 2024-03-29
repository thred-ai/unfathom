import { Dict } from 'src/app/load.service';

export class Asset {
  name!: string;
  id!: string;
  img?: string;
  thumb?: string
  metadata: Dict<any> = {};

  constructor(
    name: string,
    id: string,
    img?: string,
    thumb?: string,
    metadata: Dict<any> = {}
  ) {
    this.name = name;
    this.id = id;
    this.img = img;
    this.thumb = thumb
    this.metadata = metadata;
  }
}
