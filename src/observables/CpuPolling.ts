import { fetchCpuLoadAvg } from "../api/cpu";
import { REFRESH_RATE } from "../constants";
import { CpuLoadAvg, Observable } from "../types";

export class CpuPolling implements Observable<CpuLoadAvg> {
  private observers: Array<(cpuLoadRecord: CpuLoadAvg) => void> = [];
  private timeout?: number;
  private lastCpuLoadAvg?: CpuLoadAvg;

  constructor(private pollingRate: number = REFRESH_RATE) {}

  set refreshRate(rate: number) {
    this.pollingRate = rate;

    if (this.timeout !== undefined) {
      // reset timeout by refetching
      this.updateCpuLoadAvg();
    }
  }

  get refreshRate(): number {
    return this.pollingRate;
  }

  subscribe(observer: (cpuLoadAvg: CpuLoadAvg) => void): () => void {
    if (this.lastCpuLoadAvg !== undefined) {
      observer.call(null, this.lastCpuLoadAvg);
    }

    this.observers = [...this.observers, observer];

    // we are the first subscriber
    if (this.observers.length === 1) {
      // start fetching
      this.updateCpuLoadAvg();
    }

    return this.unsubscribeAll.bind(this);
  }

  private async updateCpuLoadAvg(): Promise<void> {
    clearTimeout(this.timeout);

    const cpuLoadAvg = await fetchCpuLoadAvg("/api/cpu");
    this.lastCpuLoadAvg = cpuLoadAvg;
    this.observers.forEach((observer) => observer(cpuLoadAvg));

    this.timeout = window.setTimeout(
      async () => await this.updateCpuLoadAvg(),
      this.pollingRate
    );
  }

  private unsubscribeAll(): void {
    clearTimeout(this.timeout);
    this.observers = [];
    this.lastCpuLoadAvg = undefined;
  }
}
