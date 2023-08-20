import { Cell } from '@antv/x6';
import { Scene } from './scene.model';

export class SceneNode implements Cell.Properties {


  constructor(scene: Scene, properties: Cell.Properties) {
    // super({ ...metadata, id: scene.id });
  }
}
