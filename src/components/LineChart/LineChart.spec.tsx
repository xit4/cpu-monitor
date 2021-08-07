import "@testing-library/jest-dom";
import { cleanup, render, screen } from "@testing-library/react";
import { LineChart } from "./LineChart";

const mockData = [
  {
    loadAvg: 0.69,
    timestamp: 1628351408656,
  },
  {
    loadAvg: 0.42,
    timestamp: 1628352408656,
  },
  {
    loadAvg: 0.42,
    timestamp: 1628353408656,
  },
  {
    loadAvg: 0.42,
    timestamp: 1628354408656,
  },
];

describe("LineChart", () => {
  afterEach(cleanup);

  test("should render a point on the chart for each data-point", () => {
    render(<LineChart data={mockData} />);
    expect(document.querySelectorAll("circle").length).toEqual(4);
  });

  test("should render tooltips for each point on the chart", () => {
    render(<LineChart data={mockData} />);
    expect(screen.getByText("0.69")).toBeDefined();
    expect(screen.getAllByText("0.42").length).toEqual(3);
  });
});
