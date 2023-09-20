export class Texture {
  ambient?: string;
  diffuse?: string;
  bump?: string;
  specular?: string;
  emissive?: string;
  lightmap?: string;
  opacity?: string;
  refraction?: string;
  reflection?: string;
  displacement?: string

  constructor(
    diffuse?: string,
    ambient?: string,
    bump?: string,
    specular?: string,
    emissive?: string,
    lightmap?: string,
    opacity?: string,
    refraction?: string,
    reflection?: string,
    displacement?: string
  ) {
    this.ambient = ambient;
    this.diffuse = diffuse;
    this.bump = bump;
    this.specular = specular;
    this.emissive = emissive;
    this.lightmap = lightmap;
    this.opacity = opacity;
    this.refraction = refraction;
    this.reflection = reflection;
    this.displacement = displacement
  }
}
