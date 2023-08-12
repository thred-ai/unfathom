export class Document {
  id!: string;
  text!: string;
  status!: number;
  collection!: string;

  constructor(
    id: string,
    text: string,
    status: number,
    collection: string
  ) {
    this.id = id;
    this.text = text;
    this.status = status ?? 1;
    this.collection = collection ?? '';
  }
}
