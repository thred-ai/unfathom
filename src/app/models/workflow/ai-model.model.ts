import { Request } from './request.model';

export class AIModel {
  name!: string;
  developer!: string;
  id!: string;
  imgUrl!: string;
  type!: string;
  status!: number;
  description: string;
  variations: any[];

  constructor(
    name: string,
    id: string,
    developer: string,
    imgUrl: string,
    type: string,
    status: number,
    description?: string,
    variations?: any[]
  ) {
    this.id = id;
    this.developer = developer ?? 'Unknown Developer';
    this.name = name ?? 'New Model';
    this.imgUrl = imgUrl ?? '';
    this.type = type ?? 'Unknown';
    this.status = status ?? 1;
    this.description = description ?? '';
    this.variations = variations ?? [];
  }
}
