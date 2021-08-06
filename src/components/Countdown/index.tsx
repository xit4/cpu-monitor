import { useEffect, useState } from "react";
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
          className={`Countdown-done ${
            currentLoad >= 1 ? "Countdown-heavy" : ""
          }`}
          style={{
            animationDuration: `${duration + 0.5}s`,
          }}
        />
      )}
    </div>
  );
};
