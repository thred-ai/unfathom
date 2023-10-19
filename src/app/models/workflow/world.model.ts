import { Ground } from './ground.model';
import { Sky } from './sky.model';
import * as uuid from 'uuid';
import { AssetMovement } from './asset-movement.model';
import { Texture } from './texture.model';
import { ModelAsset } from './model-asset.model';
import { Character } from './character.model';

export class World {
  width!: number;
  height!: number;
  sky?: Sky;
  lightingIntensity!: number;
  ground?: Ground;
  id!: string;
  uid!: string;
  name?: string;
  created!: number;
  modified!: number;
  status!: number;

  characters!: {
    character: Character;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }[];

  assets!: {
    asset: ModelAsset;
    movement: AssetMovement;
    spawn: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }[];

  constructor(
    uid: string,
    id: string = uuid.v4(),
    name: string = 'My New World',
    width: number = 1000,
    height: number = 1000,
    characters: {
      character: Character;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
    }[] = [],
    assets: {
      asset: ModelAsset;
      movement: AssetMovement;
      spawn: { x: number; y: number; z: number };
      direction: { x: number; y: number; z: number };
      scale: { x: number; y: number; z: number };
    }[] = [],
    lightingIntensity: number = 0.8,
    created: number = new Date().getTime(),
    modified: number = new Date().getTime(),
    sky: Sky = new Sky(
      1000,
      new Texture(
        'sky',
        undefined,
        undefined,
        undefined,
        undefined,
        'https://storage.googleapis.com/verticalai.appspot.com/default/sky/default_sky.png'
      )
    ),
    ground: Ground = new Ground(
      'https://storage.googleapis.com/verticalai.appspot.com/default/ground/default_map.png',
      new Texture(
        'ground',
        'https://storage.googleapis.com/verticalai.appspot.com/default/ground/texture.png'
      ),
      undefined,
      1
    ),
    status: number = 0
  ) {
    this.uid = uid;
    this.width = width;
    this.height = height;
    this.sky = sky;
    this.lightingIntensity = lightingIntensity;
    this.ground = ground;
    this.id = id;
    this.name = name;
    this.characters = characters;
    this.assets = assets;
    this.created = created;
    this.modified = modified;
    this.status = status;
  }
}
