import { Alert } from "../../types";
import { Info } from "../Info/Info";

type AlertsCounterProps = {
  loadAlerts: Alert[];
  imageSrc: string;
  label: string;
  imageAlt: string;
};

export const AlertsCounter = ({
  loadAlerts,
  imageSrc,
  label,
  imageAlt,
}: AlertsCounterProps) => (
  <>
    {!!loadAlerts.length && (
      <Info
        value={loadAlerts.length}
        label={label}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
      >
        <span className="CpuLoadMonitor-time">
          {`Last at ${new Date(
            loadAlerts[loadAlerts.length - 1].timestamp
          ).toLocaleTimeString()}`}
        </span>
      </Info>
    )}
  </>
);
