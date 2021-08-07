import { useEffect, useState } from "react";
import { LineChart } from "../LineChart/LineChart";
import {
  LOAD_HISTORY_TIME_LIMIT,
  LOAD_THRESHOLD,
  REFRESH_RATE,
} from "../../constants";
import { Alert, CpuLoadAvg } from "../../types";
import { CpuPolling, Alerts } from "../../observables";
import "./CpuLoadMonitor.css";
import cpu from "../../assets/cpu.png";
import flames from "../../assets/flames.png";
import good from "../../assets/good.png";
import { Countdown } from "..";
import { initializeHistory } from "./initializeHistory";
import { toTimeString } from "../../utils";
import { Info } from "../Info/Info";

const cpuPolling = new CpuPolling();
const alerts = new Alerts();

export const CpuLoadMonitor = () => {
  const historySize = LOAD_HISTORY_TIME_LIMIT / cpuPolling.refreshRate;
  const [loads, setLoads] = useState<CpuLoadAvg[]>(
    initializeHistory(historySize)
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

  const currentLoad = loads[loads.length - 1];
  const isCurrentLoadAboveThreshold = currentLoad.loadAvg >= LOAD_THRESHOLD;

  return (
    <div className="CpuLoadMonitor">
      <h2>CPU Average Load</h2>
      <div className="CpuLoadMonitor-header">
        <Info
          value={currentLoad.loadAvg.toFixed(2)}
          label="Last measured average load"
          highlight={isCurrentLoadAboveThreshold}
          imageSrc={cpu}
          imageAlt="CPU"
        >
          <Countdown
            duration={REFRESH_RATE}
            currentLoad={currentLoad.loadAvg}
          />
        </Info>
        {!!highLoadAlerts.length && (
          <Info
            value={highLoadAlerts.length}
            label="High load alert(s)"
            imageSrc={flames}
            imageAlt="flame"
          >
            <span className="CpuLoadMonitor-time">
              {`Last at ${new Date(
                highLoadAlerts[highLoadAlerts.length - 1].timestamp
              ).toLocaleTimeString()}`}
            </span>
          </Info>
        )}
        {!!lowLoadAlerts.length && (
          <Info
            value={lowLoadAlerts.length}
            label="Recovery alert(s)"
            imageSrc={good}
            imageAlt="happy face over red, yellow, green speedometer pointing green"
          >
            <span className="CpuLoadMonitor-time">
              {`Last at ${toTimeString(
                lowLoadAlerts[lowLoadAlerts.length - 1].timestamp
              )}`}
            </span>
          </Info>
        )}
      </div>
      <LineChart data={loads} />
    </div>
  );
};
