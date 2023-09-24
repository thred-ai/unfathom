export class AssetMovement {
  canMount!: boolean;

  gravity?: number;
  speed?: number;

  constructor(
    canMount: boolean = false,
    gravity?: number,
    speed?: number
  ) {
    this.canMount = canMount
    this.gravity = gravity
    this.speed = speed
  }
}
