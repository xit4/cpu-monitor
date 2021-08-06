import { useEffect, useState } from "react";
import { LineChart } from "../LineChart";
import { LOAD_HISTORY_TIME_LIMIT } from "../../constants";
import { CpuLoadAvg } from "../../types";
import { CpuPolling } from "../../observables";
import "./CpuLoadMonitor.css";
import cpu from "../../assets/cpu.png";
import flames from "../../assets/flames.png";
import good from "../../assets/good.png";
import { Countdown } from "../";

const cpuPolling = new CpuPolling();

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
  useEffect(() => {
    const cpuPollingUnsubscribe = cpuPolling.subscribe((cpuLoadAvg) => {
      setLoads((prevLoads) => {
        let newLoads = [...prevLoads, cpuLoadAvg];
        if (newLoads.length > historySize) {
          newLoads = newLoads.slice(
            newLoads.length - historySize,
            newLoads.length
          );
        }
        return newLoads;
      });
    });
    return cpuPollingUnsubscribe;
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
        <div className="CpuLoadMonitor-info">
          <img src={flames} className="CpuLoadMonitor-info-img" alt="CPU" />
          <div className="CpuLoadMonitor-info-content">
            <div className="CpuLoadMonitor-load">
              <span className="CpuLoadMonitor-load-value">
                {loads[loads.length - 1].loadAvg.toFixed(2)}
              </span>
              <span className="CpuLoadMonitor-load-label">
                Alert(s) of high load
              </span>
            </div>
            <span className="CpuLoadMonitor-time">
              {`Last at ${new Date(
                loads[loads.length - 1].timestamp
              ).toLocaleTimeString()}`}
            </span>
          </div>
        </div>
        <div className="CpuLoadMonitor-info">
          <img src={good} className="CpuLoadMonitor-info-img" alt="CPU" />
          <div className="CpuLoadMonitor-info-content">
            <div className="CpuLoadMonitor-load">
              <span className="CpuLoadMonitor-load-value">
                {loads[loads.length - 1].loadAvg.toFixed(2)}
              </span>
              <span className="CpuLoadMonitor-load-label">
                Alert(s) of recovered load
              </span>
            </div>
            <span className="CpuLoadMonitor-time">
              {`Last at ${new Date(
                loads[loads.length - 1].timestamp
              ).toLocaleTimeString()}`}
            </span>
          </div>
        </div>
      </div>
      <LineChart data={loads} />
    </div>
  );
};
