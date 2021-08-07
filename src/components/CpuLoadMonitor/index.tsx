import { useEffect, useState } from "react";
import { LineChart } from "../LineChart";
import { LOAD_HISTORY_TIME_LIMIT } from "../../constants";
import { Alert, CpuLoadAvg } from "../../types";
import { CpuPolling, Alerts } from "../../observables";
import "./CpuLoadMonitor.css";
import cpu from "../../assets/cpu.png";
import flames from "../../assets/flames.png";
import good from "../../assets/good.png";
import { Countdown } from "../";

const cpuPolling = new CpuPolling();
const alerts = new Alerts();

export const CpuLoadMonitor = () => {
  const historySize = LOAD_HISTORY_TIME_LIMIT / cpuPolling.refreshRate;
  const [loads, setLoads] = useState<CpuLoadAvg[]>(
    Array(historySize)
      .fill({ loadAvg: 0 })
      .map((l, idx) => ({
        ...l,
        timestamp: Date.now() - 10000 * (historySize - idx),
      }))
  );
  const [highLoadAlerts, setHighLoadAlerts] = useState<Alert[]>([]);
  const [lowLoadAlerts, setLowLoadAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const alertsUnsubscribe = alerts.subscribe((alert) => {
      if (alert.type === "High") {
        setHighLoadAlerts((prevHighAlerts) => [...prevHighAlerts, alert]);
      } else if (alert.type === "Low") {
        setLowLoadAlerts((prevLowAlerts) => [...prevLowAlerts, alert]);
      }
    });
    const cpuPollingUnsubscribe = cpuPolling.subscribe((cpuLoadAvg) => {
      setLoads((prevLoads) => {
        let newLoads = [...prevLoads, cpuLoadAvg];
        if (newLoads.length > historySize) {
          newLoads = newLoads.slice(
            newLoads.length - historySize,
            newLoads.length
          );
        }
        alerts.check(cpuLoadAvg);
        return newLoads;
      });
    });
    return () => {
      cpuPollingUnsubscribe();
      alertsUnsubscribe();
    };
  }, [historySize]);

  return (
    <div className="CpuLoadMonitor">
      <h2>CPU Average Load</h2>
      <div className="CpuLoadMonitor-header">
        <div className="CpuLoadMonitor-info">
          <img src={cpu} className="CpuLoadMonitor-info-img" alt="CPU" />
          <div className="CpuLoadMonitor-info-content">
            <div className="CpuLoadMonitor-load">
              <span className="CpuLoadMonitor-load-value">
                {loads[loads.length - 1].loadAvg.toFixed(2)}
              </span>
              <span className="CpuLoadMonitor-load-label">
                Last measured average load
              </span>
            </div>
            <Countdown
              duration={10}
              currentLoad={loads[loads.length - 1].loadAvg}
            />
          </div>
        </div>
        {!!highLoadAlerts.length && (
          <div className="CpuLoadMonitor-info">
            <img src={flames} className="CpuLoadMonitor-info-img" alt="flame" />
            <div className="CpuLoadMonitor-info-content">
              <div className="CpuLoadMonitor-load">
                <span className="CpuLoadMonitor-load-value">
                  {highLoadAlerts.length}
                </span>
                <span className="CpuLoadMonitor-load-label">
                  High load alert(s)
                </span>
              </div>
              <span className="CpuLoadMonitor-time">
                {`Last at ${new Date(
                  highLoadAlerts[highLoadAlerts.length - 1].timestamp
                ).toLocaleTimeString()}`}
              </span>
            </div>
          </div>
        )}
        {!!lowLoadAlerts.length && (
          <div className="CpuLoadMonitor-info">
            <img
              src={good}
              className="CpuLoadMonitor-info-img"
              alt="happy face over red, yellow, green speedometer pointing green"
            />
            <div className="CpuLoadMonitor-info-content">
              <div className="CpuLoadMonitor-load">
                <span className="CpuLoadMonitor-load-value">
                  {lowLoadAlerts.length}
                </span>
                <span className="CpuLoadMonitor-load-label">
                  Recovery alert(s)
                </span>
              </div>
              <span className="CpuLoadMonitor-time">
                {`Last at ${new Date(
                  lowLoadAlerts[lowLoadAlerts.length - 1].timestamp
                ).toLocaleTimeString()}`}
              </span>
            </div>
          </div>
        )}
      </div>
      <LineChart data={loads} />
    </div>
  );
};
