export class Character {
  id!: string;
  name!: string;
  background!: string;
  img!: string;
  personality!: string;
  type!: 'hero' | 'villain' | 'side' | 'other';
  assetUrl?: string

  constructor(
    id: string,
    name: string,
    assetUrl?: string,
    background?: string,
    img?: string,
    personality?: string,
    type?: 'hero' | 'villain' | 'side' | 'other'
  ) {
    this.id = id;
    this.name = name;
    this.assetUrl = assetUrl
    this.background = background ?? '';
    this.img = img ?? '';
    this.personality = personality ?? '';
    this.type = type ?? 'other';
  }
}
