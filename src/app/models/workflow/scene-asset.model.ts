import { AssetMovement } from './asset-movement.model';
import { ModelAsset } from './model-asset.model';

export class SceneAsset {
  asset!: ModelAsset;
  movement!: AssetMovement;
  spawn!: { x: number; y: number; z: number };
  direction!: { x: number; y: number; z: number };
  scale!: { x: number; y: number; z: number };

  constructor(
    asset: ModelAsset,
    spawn: { x: number; y: number; z: number } = {
      x: 0,
      y: 0,
      z: 0,
    },
    direction: { x: number; y: number; z: number } = {
      x: 0,
      y: 0,
      z: 0,
    },
    scale: { x: number; y: number; z: number } = {
      x: 1,
      y: 1,
      z: 1,
    },
    movement: AssetMovement = new AssetMovement(false)
  ) {
    this.asset = asset;
    this.movement = movement;
    this.spawn = spawn;
    this.direction = direction;
    this.scale = scale;
  }
}
