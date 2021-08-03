const os = require("os");
const cpuAPI = require("./cpu");

jest.mock("os", () => ({
  loadavg: jest.fn().mockImplementation(() => [0.8, 1, 1]),
  cpus: jest.fn().mockImplementation(() => [1, 2, 3, 4]),
}));

describe("fetchLoadAvg", () => {
  test("should return current loadAvg normalized by number of CPUs", () => {
    let currentLoadAvg = cpuAPI.fetchLoadAvg();
    expect(currentLoadAvg.loadAvg).toEqual(0.2);

    os.loadavg.mockImplementationOnce(() => [0.4, 5, 5]);
    currentLoadAvg = cpuAPI.fetchLoadAvg();
    expect(currentLoadAvg.loadAvg).toEqual(0.1);
  });

  it("should compute the timestamp", () => {
    const tmpDateNow = Date.now.bind(global.Date);
    const dateNowStub = jest.fn(() => 1628009572626);
    global.Date.now = dateNowStub;

    const currentLoadAvg = cpuAPI.fetchLoadAvg();

    expect(currentLoadAvg.timestamp).toBe(1628009572626);

    // restore Date.now
    global.Date.now = tmpDateNow;
  });
});
