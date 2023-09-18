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


  constructor(
    id: string,
    size: number = 1000,
    lightingIntensity: number = 0.8,
    sky?: Sky,
    ground?: Ground,
  ) {
    this.size = size;
    this.sky = sky;
    this.lightingIntensity = lightingIntensity;
    this.ground = ground;
    this.id = id;

    
  }
}
