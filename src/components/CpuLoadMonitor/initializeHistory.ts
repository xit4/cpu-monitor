import { REFRESH_RATE } from "../../constants";
import { CpuLoadAvg } from "../../types";

export const initializeHistory = (size: number): CpuLoadAvg[] => {
  return Array(size)
    .fill({ loadAvg: 0 })
    .map((l, idx) => ({
      ...l,
      timestamp: Date.now() - REFRESH_RATE * (size - idx),
    }));
};
