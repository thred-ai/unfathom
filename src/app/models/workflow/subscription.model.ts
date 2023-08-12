
export class Subscription {
  id!: string;
  planId: string;
  status!: string;
  requests!: number;
  overage!: number;
  nextDate?: number;
  currentDate?: number;

  constructor(
    id: string,
    planId: string,
    status: string,
    requests: number,
    overage: number,
    nextDate?: number,
    currentDate?: number
  ) {
    this.id = id;
    this.planId = planId
    this.requests = requests ?? 0;
    this.overage = overage ?? 0;
    this.nextDate = nextDate ?? new Date().getTime();
    this.currentDate = currentDate ?? new Date().getTime();
    this.status = status ?? '';
  }
}
