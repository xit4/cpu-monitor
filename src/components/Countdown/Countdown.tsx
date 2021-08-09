import { useEffect, useState } from "react";
import { LOAD_THRESHOLD } from "../../constants";
import { cn } from "../../utils";
import "./Countdown.css";

type CountdownProps = {
  duration: number;
  currentLoad: number;
};

export const Countdown = ({ duration, currentLoad }: CountdownProps) => {
  // the following state and effect are mostly to keep the Countdown in sync with the polling
  const [showBar, setShowBar] = useState(true);
  useEffect(() => {
    setShowBar(false);
    setTimeout(() => setShowBar(true));
  }, [currentLoad]);
  
  return (
    <div className="Countdown">
      {showBar && (
        <div
          className={cn("Countdown-done", {
            "Countdown-heavy": currentLoad >= LOAD_THRESHOLD,
          })}
          style={{
            animationDuration: `${duration + 500}ms`,
          }}
        />
      )}
    </div>
  );
};
