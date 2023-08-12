export class Media {
  title: string;
  description: string;
  url: string;
  type: string;
  date: number;

  constructor(
    title: string,
    url: string,
    type: string,
    description?: string,
    date?: number
  ) {
    this.title = title ?? 'New File';
    this.description = description ?? '';
    this.url = url ?? '';
    this.date = date ?? new Date().getTime();
    this.type = type;
  }
}
