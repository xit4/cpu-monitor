import React, { useEffect, useState } from "react";
import "./App.css";
import { CpuPolling } from "./observables/CpuPolling";
import { LOAD_HISTORY_TIME_LIMIT } from "./constants";
import { CpuLoadAvg } from "./types";

const cpuPolling = new CpuPolling(5000);

function App() {
  const [loads, setLoads] = useState<CpuLoadAvg[]>([]);
  useEffect(() => {
    const cpuPollingUnsubscribe = cpuPolling.subscribe((cpuLoadAvg) => {
      const historySize = LOAD_HISTORY_TIME_LIMIT / cpuPolling.refreshRate;
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

    return () => {
      cpuPollingUnsubscribe();
    };
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <div>{JSON.stringify(loads)}</div>
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
