export type AlertType = "High" | "Low";

export type Alert = {
  type: AlertType;
  timestamp: number;
};
