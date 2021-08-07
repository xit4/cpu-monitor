import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { Alert, CpuLoadAvg } from "../../types";
import { CpuLoadMonitor } from "./CpuLoadMonitor";

let cpuObserver: any;
let alertsObserver: any;
jest.mock("../../observables", () => ({
  CpuPolling: jest.fn().mockImplementation(() => ({
    refreshRate: 10000,
    subscribe: (observer: (cpuLoadAvg: CpuLoadAvg) => void) => {
      cpuObserver = observer;
      observer({
        loadAvg: 0.69233332102006,
        timestamp: 1628351408656,
      });
      return () => {};
    },
  })),
  Alerts: jest.fn().mockImplementation(() => ({
    check: jest.fn(),
    subscribe: (observer: (alert: Alert) => void) => {
      alertsObserver = observer;
      observer({
        type: "High",
        timestamp: 1628351408656,
      });

      return () => {};
    },
  })),
}));

describe("CpuLoadMonitor", () => {
  afterEach(cleanup);

  test("should show current load", () => {
    render(<CpuLoadMonitor />);
    expect(screen.getAllByText("0.69").length).toBe(2);
  });
  test("should initialize the correct number of history points", () => {
    render(<CpuLoadMonitor />);
    expect(document.querySelectorAll("circle").length).toEqual(60);
  });
  test("should update the current load", () => {
    render(<CpuLoadMonitor />);
    act(() => {
      cpuObserver({
        loadAvg: 0.42233332102006,
        timestamp: 1628352408656,
      });
      cpuObserver({
        loadAvg: 0.37233332102006,
        timestamp: 1628353408656,
      });
    });
    expect(screen.getAllByText("0.69").length).toBe(1);
    expect(screen.getAllByText("0.42").length).toBe(1);
    expect(screen.getAllByText("0.37").length).toBe(2);
  });
  test("should show alert count", () => {
    render(<CpuLoadMonitor />);
    expect(screen.getByText(/high load alert/i)).toBeDefined();
    expect(screen.queryByText(/recovery/i)).toBeNull();
  });

  test("should update alert count", () => {
    render(<CpuLoadMonitor />);
    act(() => {
      alertsObserver({
        type: "High",
        timestamp: 1628352408656,
      });
      alertsObserver({
        type: "Low",
        timestamp: 1628353408656,
      });
    });
    expect(screen.getAllByText(/high load alert/i)).toBeDefined();
    expect(screen.getAllByText(/recovery/i)).toBeDefined();
    expect(screen.getAllByText("2")).toBeDefined();
    expect(screen.getAllByText("1")).toBeDefined();
  });
});
