import { Alerts } from "./Alerts";

describe("Alerts", () => {
  let alerts: Alerts;
  let observerSpy = jest.fn();

  jest.useFakeTimers();

  beforeEach(() => {
    alerts = new Alerts();
    alerts.subscribe(observerSpy);
  });

  afterEach(() => {
    observerSpy.mockClear();
  });

  test("should be instanced", () => {
    expect(alerts).not.toBeUndefined();
  });

  test("should not dispatch alerts if the load never exceeded the threshold", () => {
    // simulates normal load for two minutes
    alerts.check({ loadAvg: 0.1, timestamp: 1609932400001 });
    alerts.check({ loadAvg: 0.2, timestamp: 1609932605002 });
    alerts.check({ loadAvg: 0.3, timestamp: 1609932735003 });

    expect(observerSpy).toHaveBeenCalledTimes(0);
  });

  test("should not dispatch an alert if enough time has not passed between loads of the same type", () => {
    // simulates heavy load for 1 minute
    alerts.check({ loadAvg: 1.1, timestamp: 1609932400001 });
    alerts.check({ loadAvg: 1.2, timestamp: 1609932465002 });

    expect(observerSpy).toHaveBeenCalledTimes(0);
  });

  test("after enough time has passed between load avgs of the same type an alert should be dispatched", () => {
    // simulates heavy load for two minutes
    alerts.check({ loadAvg: 1.1, timestamp: 1609932400001 });
    alerts.check({ loadAvg: 1.2, timestamp: 1609932605002 });

    expect(observerSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy).toHaveBeenCalledWith({
      type: "High",
      timestamp: 1609932605002,
    });
  });

  test("should not dispatch alerts for every new load of the same time once an action has already been dispatched", () => {
    // simulates heavy load for two minutes and then two more
    alerts.check({ loadAvg: 1.1, timestamp: 1609932400001 });
    alerts.check({ loadAvg: 1.2, timestamp: 1609932605002 });
    alerts.check({ loadAvg: 1.3, timestamp: 1609932735003 });

    expect(observerSpy).toHaveBeenCalledTimes(1);
    expect(observerSpy).toHaveBeenCalledWith({
      type: "High",
      timestamp: 1609932605002,
    });
  });

  test("should dispatch a recovery alert if the load comes down from heavy load", () => {
    // simulates normal load for two minutes after two minutes of heavy load
    alerts.check({ loadAvg: 1.1, timestamp: 1609932400001 });
    alerts.check({ loadAvg: 1.2, timestamp: 1609932605002 });
    alerts.check({ loadAvg: 0.3, timestamp: 1609932735003 });
    alerts.check({ loadAvg: 0.3, timestamp: 1609932905003 });

    expect(observerSpy).toHaveBeenCalledTimes(2);
    expect(observerSpy).toHaveBeenLastCalledWith({
      timestamp: 1609932905003,
      type: "Low",
    });
  });
});
