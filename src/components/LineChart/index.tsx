import * as d3 from "d3";
import { MouseEventHandler, useState } from "react";
import { LOAD_THRESHOLD } from "../../constants";
import { CpuLoadAvg } from "../../types";
import "./LineChart.css";

const margin = { top: 8, right: 24, bottom: 48, left: 24 },
  width = 800,
  height = 400;

type LineChartProps = {
  data: CpuLoadAvg[];
};

export const LineChart = ({ data }: LineChartProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const yMaxValue = d3.max(data, (d) => d.loadAvg) ?? 1;

  const getX = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => d.timestamp) as [number, number])
    .range([margin.left, width - margin.right]);

  const getY = d3
    .scaleLinear()
    .domain([0, Math.max(LOAD_THRESHOLD + 0.4, yMaxValue + 0.4)])
    .range([height - margin.top, 0]);

  const linePath = d3
    .line()
    .x((d: any) => getX(d.timestamp))
    .y((d: any) => getY(d.loadAvg))
    .curve(d3.curveMonotoneX)(data as any);

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
        viewBox={`0 0 ${width} ${height}`}
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
            <stop offset="50%" stop-color="#0368ac" />
            <stop offset="90%" stop-color="#ffe07d" />
            <stop offset="100%" stop-color="#da3838" />
          </linearGradient>
        </defs>
        <line
          stroke-dasharray="5, 10"
          x1={margin.left}
          y1={getY(LOAD_THRESHOLD)}
          x2={width - margin.right}
          y2={getY(LOAD_THRESHOLD)}
          stroke="#da3838"
        ></line>
        <text
          className="LineChart-threshold-label"
          fill="currentColor"
          x={margin.left}
          y={getY(LOAD_THRESHOLD) - 2}
        >
          High average load threshold
        </text>
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
          <text
            key={item.timestamp}
            className={`tooltip ${idx === activeIndex ? "active" : ""}`}
            fill="currentColor"
            x={getX(item.timestamp)}
            y={getY(item.loadAvg) - 15}
            textAnchor="middle"
          >
            {item.loadAvg.toFixed(2)}
          </text>
        ))}
        {data.map(
          (item, idx) =>
            !!item.loadAvg && (
              <text
                key={item.timestamp}
                className={`tooltipTime ${idx === activeIndex ? "active" : ""}`}
                fill="currentColor"
                x={getX(item.timestamp)}
                y={getY(item.loadAvg) - 35}
                textAnchor="middle"
              >
                {new Date(item.timestamp).toLocaleTimeString().split(" ")[0]}
              </text>
            )
        )}
      </svg>
    </div>
  );
};
