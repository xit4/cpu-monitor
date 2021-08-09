import * as d3 from "d3";
import { MouseEventHandler, useState } from "react";
import { LOAD_THRESHOLD } from "../../constants";
import { CpuLoadAvg } from "../../types";
import { cn, toTimeString } from "../../utils";
import "./LineChart.css";

const MARGIN = { top: 8, right: 24, bottom: 48, left: 24 },
  WIDTH = 800,
  HEIGHT = 400;

type LineChartProps = {
  data: CpuLoadAvg[];
};

export const LineChart = ({ data }: LineChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const yMaxValue = d3.max(data, (d) => d.loadAvg) ?? LOAD_THRESHOLD;

  const getX = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.timestamp) as [number, number])
    .range([MARGIN.left, WIDTH - MARGIN.right]);

  const getY = d3
    .scaleLinear()
    .domain([0, Math.max(yMaxValue + 0.4)])
    .range([HEIGHT - MARGIN.top, 0]);

  const linePath = d3
    .line<CpuLoadAvg>()
    .x((d) => getX(d.timestamp))
    .y((d) => getY(d.loadAvg))
    .curve(d3.curveMonotoneX)(data);

  const handleMouseMove: MouseEventHandler<SVGElement> = (e) => {
    const bisect = d3.bisector((d: CpuLoadAvg) => d.timestamp).center,
      x0 = getX.invert(d3.pointer(e, this)[0]),
      index = bisect(data, x0);
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="LineChart">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient
            id="heatGradient"
            gradientUnits="userSpaceOnUse"
            x1="0%"
            y1={getY(0)}
            x2="0%"
            y2={getY(LOAD_THRESHOLD)}
          >
            <stop offset="50%" stopColor="#0368ac" />
            <stop offset="90%" stopColor="#ffe07d" />
            <stop offset="100%" stopColor="#da3838" />
          </linearGradient>
        </defs>
        {/* dashed line representing the threshold */}
        <line
          strokeDasharray="5, 10"
          x1={MARGIN.left}
          y1={getY(LOAD_THRESHOLD)}
          x2={WIDTH - MARGIN.right}
          y2={getY(LOAD_THRESHOLD)}
          stroke="#da3838"
        ></line>
        {/* label for the threshold line */}
        <text
          className="LineChart-threshold-label"
          fill="currentColor"
          x={MARGIN.left}
          y={getY(LOAD_THRESHOLD) - 2}
        >
          High average load threshold
        </text>
        {/* the actual line connecting the load points plotted on the chart */}
        <path
          strokeWidth={3}
          fill="none"
          stroke={"url(#heatGradient)"}
          d={linePath ?? ""}
        />
        {/*
         * the following cycles are repetead three times so that the
         * last SVG will not be rendered on top of the previous ones in
         * ascending curves.
         * AKA text shows on top of circles when the curve is going up
         */}
        {data.map((item, idx) => (
          /* dots representing loads on the chart */
          <circle
            key={item.timestamp}
            cx={getX(item.timestamp)}
            cy={getY(item.loadAvg)}
            r={idx === activeIndex ? 6 : 4}
            fill="url(#heatGradient)"
            strokeWidth={idx === activeIndex ? 2 : 0}
            stroke="currentColor"
          />
        ))}
        {data.map((item, idx) => (
          /* tooltips for each load point*/
          <>
            <text
              key={`${item.timestamp}_load`}
              className={cn("LineChart-tooltip", {
                "LineChart-tooltip-active": idx === activeIndex,
              })}
              fill="currentColor"
              x={getX(item.timestamp)}
              y={getY(item.loadAvg) - 15}
              textAnchor="middle"
            >
              {item.loadAvg.toFixed(2)}
            </text>
            {!!item.loadAvg && (
              <text
                key={`${item.timestamp}_timestamp`}
                className={cn("LineChart-tooltip-time", {
                  "LineChart-tooltip-active": idx === activeIndex,
                })}
                fill="currentColor"
                x={getX(item.timestamp)}
                y={getY(item.loadAvg) - 35}
                textAnchor="middle"
              >
                {toTimeString(item.timestamp)}
              </text>
            )}
          </>
        ))}
      </svg>
    </div>
  );
};
