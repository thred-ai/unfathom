import { SceneDefinition } from './scene-definition.model';

export class Scene extends SceneDefinition {
  description!: string;
  id!: string;
  images!: string[];
  characters!: any[];
  notes!: string;

  constructor(
    id: string,
    name: string = 'My New Scene',
    description: string = '',
    images: string[] = [],
    characters: any[] = [],
    notes: string = '',
    type: string = 'scene'
  ) {
    super(name, images[0], type);

    this.name = name;
    this.description = description;
    this.images = images;
    this.characters = characters;
    this.id = id;
    this.notes = notes;
  }
}
