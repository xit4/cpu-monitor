import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { AlertsCounter } from "./AlertsCounter";

describe("AlertsCounter", () => {
  const alertsCounterMock = {
    loadAlerts: [
      {
        type: "High" as const,
        timestamp: 1628351108656,
      },
      {
        type: "High" as const,
        timestamp: 1628351208656,
      },
      {
        type: "High" as const,
        timestamp: 1628351308656,
      },
      {
        type: "High" as const,
        timestamp: 1628351408656,
      },
    ],
    imageAlt: "",
    imageSrc: "",
    label: "",
  };

  afterEach(cleanup);

  test("should show the correct count of alerts and the time of the last one", () => {
    render(<AlertsCounter {...alertsCounterMock} />);
    expect(screen.getAllByText(/1/)).toBeDefined();
    expect(screen.getAllByText(/17:50:08/)).toBeDefined();
  });
});
