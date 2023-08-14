export class SceneDefinition {
  name!: string;
  image!: string;
  type!: string;

  constructor(name: string, image: string, type: string) {
    this.name = name;
    this.image = image;
    this.type = type;
  }
}
