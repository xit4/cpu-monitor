import { useEffect, useState } from "react";
import { LineChart } from "../LineChart";
import { LOAD_HISTORY_TIME_LIMIT } from "../../constants";
import { CpuLoadAvg } from "../../types";
import { CpuPolling } from "../../observables/CpuPolling";
import "./CpuLoadMonitor.css";

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
    <main className="Box">
      <h1>CPU Load Monitor</h1>
      <LineChart data={loads} />
    </main>
  );
};
