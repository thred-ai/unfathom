import { Character } from './character.model';
import { Ground } from './ground.model';
import { ModelAsset } from './model-asset.model';
import { Sky } from './sky.model';

export class World {
  size!: number;
  sky?: Sky;
  lightingIntensity!: number;
  ground?: Ground;
  id!: string;

  characters!: {
    id: string;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: number;
  }[];

  assets!: {
    data: ModelAsset;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: number;
  }[];

  constructor(
    id: string,
    size: number = 1000,
    lightingIntensity: number = 0.8,
    sky?: Sky,
    ground?: Ground,
    characters: {
      id: string;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: number;
    }[] = [],
    assets: {
      data: ModelAsset;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: number;
    }[] = []
  ) {
    this.size = size;
    this.sky = sky;
    this.lightingIntensity = lightingIntensity;
    this.ground = ground;
    this.id = id;
    this.characters = characters;
    this.assets = assets;
  }
}
