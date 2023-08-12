
export class Plan {
  name!: string;
  id!: string;
  requests!: number;
  overagePriceCents!: number;
  overageUnit!: number
  flatPriceCents!: number
  backgroundColor!: string;

  constructor(
    name: string,
    id: string,
    requests: number,
    overageUnit: number,
    overagePriceCents: number,
    flatPriceCents: number,
    backgroundColor: string
  ) {
    this.id = id;
    this.requests = requests ?? 0;
    this.overageUnit = overageUnit ?? 0
    this.overagePriceCents = overagePriceCents ?? 0;
    this.flatPriceCents = flatPriceCents ?? 0
    this.name = name ?? 'Unknown Plan';
    this.backgroundColor = backgroundColor ?? '#000'
  }
}
