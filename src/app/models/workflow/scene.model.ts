export class Scene {
  name!: string;
  description!: string;
  id!: string;
  images!: string[];
  characters!: any[];
  notes!: string;

  constructor(
    id: string,
    name: string = 'My New Scene',
    description: string = "",
    images: string[] = [],
    characters: any[] = [],
    notes: string = ""
  ) {
    this.name = name
    this.description = description
    this.images = images
    this.characters = characters
    this.id = id;
    this.notes = notes
  }
}
