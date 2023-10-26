import { Character } from './character.model';

export class SceneCharacter {
  character!: Character;
  spawn!: { x: number; y: number; z: number };
  direction!: { x: number; y: number; z: number };
  scale!: { x: number; y: number; z: number };

  constructor(
    character: Character,
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
    }
  ) {
    this.character = character;
    this.spawn = spawn;
    this.direction = direction;
    this.scale = scale;
  }
}
