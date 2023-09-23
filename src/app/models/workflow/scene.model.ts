import { Dict } from 'src/app/load.service';
import { Character } from './character.model';
import { SceneDefinition } from './scene-definition.model';
import { ModelAsset } from './model-asset.model';

export class Scene extends SceneDefinition {
  description!: string;
  id!: string;
  images!: string[];

  // precipitation: string

  notes!: string;

  characters!: {
    id: string;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: number;
  }[];

  assets!: {
    id: string;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: number;
  }[];

  constructor(
    id: string,
    name: string = 'My New Scene',
    description: string = '',
    images: string[] = [],
    notes: string = '',
    type: string = 'scene',
    characters: {
      id: string;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: number;
    }[] = [],
    assets: {
      id: string;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: number;
    }[] = []
  ) {
    super(name, images[0], type);

    this.name = name;
    this.description = description;
    this.images = images;
    this.id = id;
    this.notes = notes;
    this.characters = characters;
    this.assets = assets;
  }
}
