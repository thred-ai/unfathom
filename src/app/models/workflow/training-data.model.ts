export class TrainingData {
  id!: string;
  type!: string;
  data: any;

  constructor(id: string, type: string, data: any) {
    this.id = id;
    this.type = type == 'text' ? 'plaintext' : type ?? 'plaintext';
    this.data = data;
  }
}
