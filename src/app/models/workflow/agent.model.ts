
export class Agent {
  id!: string;
  type!: string;
  source!: string | null;
  compiled!: string | null;  

  constructor(id: string, type: string, source: string | null, compiled: string | null) {
    this.type = type
    this.id = id;
    this.source = source;
    this.compiled = compiled
  }
}
