import "@testing-library/jest-dom";
import { cleanup, render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { LOAD_THRESHOLD } from "../../constants";
import { Countdown } from "./Countdown";

describe("Countdown", () => {
  afterEach(cleanup);

  test("should be in its normal state if load is under threshold", () => {
    render(<Countdown duration={10000} currentLoad={LOAD_THRESHOLD - 0.005} />);
    expect(document.querySelector(".Countdown-heavy")).toBeNull();
  });

  test("should be in its enhanced state if load is above threshold", () => {
    jest.useFakeTimers();
    render(<Countdown duration={10000} currentLoad={1.5} />);
    act(() => {
      jest.runAllTimers();
    });
    expect(document.querySelector(".Countdown-heavy")).not.toBeNull();
  });
});
