import { Executable } from "../workflow/executable.model";

export class Developer {
  name!: string;
  id!: string;
  url!: string;
  date!: number;
  email!: string;
  utils: Executable[];
  theme: 'light' | 'dark' | 'auto'

  constructor(
    name: string,
    id: string,
    date: number,
    url: string,
    email: string,
    utils?: Executable[],
    theme?: 'light' | 'dark' | 'auto'
  ) {
    this.name = name ?? 'New';
    this.id = id;
    this.utils = utils ?? [];
    this.date = date ?? 3;
    this.url = url;
    this.email = email;
    this.theme = theme ?? 'auto'
  }
}
