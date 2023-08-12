export class Collection {
  id!: string;
  status!: number;

  constructor(
    id: string,
    status: number,
  ) {
    this.id = id;
    this.status = status ?? 1;
  }
}
