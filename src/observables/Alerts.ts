import { TIME_LIMIT, LOAD_THRESHOLD } from "../constants";
import { CpuLoadAvg, Observable } from "../types";
import { Alert, AlertType } from "../types";

export class Alerts implements Observable<Alert> {
  private observers: Array<(alert: Alert) => void> = [];
  private dispatched: boolean = false;
  private firstHighAlertDispathed: boolean = false;
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
      // we have not spawned an alert and we just crossed the threshold going up
      this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
    } else if (this.lastAlert && this.lastAlert.type !== cpuLoadAvgType) {
      // we are already tracking a trend but the load type changed
      if (cpuLoadAvgType === "Low" && !this.firstHighAlertDispathed) {
        // simulating a dispatched alert in case we have a recovery without the high load having triggered an alert
        this.dispatched = true;
      } else {
        this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
        this.dispatched = false;
      }
    } else if (
      this.lastAlert &&
      this.lastAlert.type === cpuLoadAvgType &&
      !this.dispatched
    ) {
      // we are already tracking a trend and the load type did not change
      const isOverTimeLimit =
        cpuLoadAvg.timestamp - this.lastAlert.timestamp >= this.timeLimit;
      if (isOverTimeLimit) {
        // once we break the time limit we can notify all subscribers
        this.replaceLastAlert(cpuLoadAvgType, cpuLoadAvg.timestamp);
        this.dispatched = true;
        this.observers.forEach((observer) => observer(this.lastAlert!));
        this.firstHighAlertDispathed = true;
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
