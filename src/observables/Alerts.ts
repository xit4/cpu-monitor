import { TIME_LIMIT, LOAD_THRESHOLD } from "../constants";
import { CpuLoadAvg, Observable } from "../types";
import { Alert, AlertType } from "../types";

export class Alerts implements Observable<Alert> {
  private observers: Array<(alert: Alert) => void> = [];
  private submitted: boolean = false;
  private lastAlert?: Alert;

  constructor(private timeLimit: number = TIME_LIMIT) {}

  private replaceLastAlert(alertType: AlertType, timestamp: number) {
    this.lastAlert = {
      type: alertType,
      timestamp: timestamp,
    };
  }
  check(cpuLoadAvg: CpuLoadAvg) {
    const cpuLoadAvgType: AlertType =
      cpuLoadAvg.loadAvg >= LOAD_THRESHOLD ? "High" : "Low";
    if (!this.lastAlert && cpuLoadAvgType === "High") {
      // if we have not spawned an alert and we just crossed the threshold going up
      this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
    } else if (this.lastAlert && this.lastAlert.type !== cpuLoadAvgType) {
      // if we are already tracking and the load type changed
      this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
      this.submitted = false;
    } else if (
      this.lastAlert &&
      this.lastAlert.type === cpuLoadAvgType &&
      !this.submitted
    ) {
      // if we are already tracking and the load type did not change
      const isOverTimeLimit =
        cpuLoadAvg.timestamp - this.lastAlert.timestamp >= this.timeLimit;
      if (isOverTimeLimit) {
        this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
        this.submitted = true;
        this.observers.forEach((observer) => observer(this.lastAlert!));
      }
    }
  }

  subscribe(observer: (alert: Alert) => void): () => void {
    this.observers = [...this.observers, observer];
    return this.unsubscribeAll.bind(this);
  }

  private unsubscribeAll(): void {
    this.observers = [];
    this.lastAlert = undefined;
  }
}
