export class Trigger {
  name!: string;
  id!: string;
  imgUrl!: string;
  status!: number;
  execution!: { min: number; max: number };

  constructor(
    name: string,
    id: string,
    imgUrl: string,
    status: number,
    execution: { min: number; max: number }
  ) {
    this.id = id;
    this.name = name ?? 'New Agent';
    this.imgUrl = imgUrl ?? '';
    this.status = status ?? 1;
    this.execution = execution ?? {min: 0, max: 0}
  }
}
