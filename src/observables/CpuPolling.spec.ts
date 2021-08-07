import { REFRESH_RATE } from "../constants";
import { CpuPolling } from "./CpuPolling";

let mockFetchCpuLoadAvg = () =>
  Promise.resolve({
    loadAvg: 0.12233332101001,
    timestamp: 1609932400001,
  });

jest.mock("../api/cpu", () => ({
  fetchCpuLoadAvg: () => mockFetchCpuLoadAvg(),
}));

describe("CpuPolling", () => {
  const pollingRateMock = 1000;
  let cpuPolling: CpuPolling;
  let flushSubscriptions: () => void;
  const flushPromises = () => new Promise(setImmediate);

  beforeEach(() => {
    cpuPolling = new CpuPolling(pollingRateMock);
  });

  afterEach(() => {
    if (flushSubscriptions) {
      flushSubscriptions();
    }
  });

  test("should be instanced", () => {
    expect(cpuPolling).not.toBeUndefined();
  });

  test("should be able to access the pollingRate", () => {
    expect(new CpuPolling().refreshRate).toBe(REFRESH_RATE);
  });

  test("should emit values through the subscribe() method", (done) => {
    flushSubscriptions = cpuPolling.subscribe((data) => {
      expect(data).toEqual({
        loadAvg: 0.12233332101001,
        timestamp: 1609932400001,
      });
      done();
    });
  });

  test("should broadcast the same value to all subscribers", async () => {
    const firstSubscriber = jest.fn();
    const secondSubscriber = jest.fn();

    cpuPolling.subscribe(firstSubscriber);
    flushSubscriptions = cpuPolling.subscribe(secondSubscriber);

    await flushPromises();

    expect(firstSubscriber).toHaveBeenCalledWith({
      loadAvg: 0.12233332101001,
      timestamp: 1609932400001,
    });
    expect(secondSubscriber).toHaveBeenCalledWith({
      loadAvg: 0.12233332101001,
      timestamp: 1609932400001,
    });
  });

  test("should broadcast values subscribers at each polling cycle", async () => {
    const firstSubscriber = jest.fn();
    const secondSubscriber = jest.fn();

    cpuPolling.subscribe(firstSubscriber);
    flushSubscriptions = cpuPolling.subscribe(secondSubscriber);

    await new Promise((resolve) => setTimeout(resolve, 2500));

    await flushPromises();

    expect(firstSubscriber).toHaveBeenCalledTimes(3);
    expect(secondSubscriber).toHaveBeenCalledTimes(3);
  });
});
