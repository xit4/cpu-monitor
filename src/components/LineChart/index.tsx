import * as d3 from "d3";
import { MouseEventHandler, useState } from "react";
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
    .domain([0, Math.max(1.5, yMaxValue + 0.25)])
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
            y2={getY(1)}
          >
            <stop offset="0%" stop-color="green" />
            <stop offset="90%" stop-color="yellow" />
            <stop offset="100%" stop-color="red" />
          </linearGradient>
        </defs>
        <text
          fill="#fff"
          x={width / 2}
          y={getY(1) - 15}
          textAnchor="middle"
        >
          High average load threshold
        </text>
        <line
          stroke-dasharray="5, 10"
          x1={margin.left}
          y1={getY(1)}
          x2={width - margin.right}
          y2={getY(1)}
          stroke="red"
        ></line>
        <path
          strokeWidth={3}
          fill="none"
          stroke={"url(#heatGradient)"}
          d={linePath ?? ""}
        />
        {data.map((item, idx) => {
          return (
            <g key={item.timestamp}>
              <text
                className={`tooltip ${idx === activeIndex ? "active" : ""}`}
                fill="#fff"
                x={getX(item.timestamp)}
                y={getY(item.loadAvg) - 15}
                textAnchor="middle"
              >
                {item.loadAvg.toFixed(2)}
              </text>
              <circle
                cx={getX(item.timestamp)}
                cy={getY(item.loadAvg)}
                r={idx === activeIndex ? 6 : 4}
                fill="url(#heatGradient)"
                strokeWidth={idx === activeIndex ? 2 : 0}
                stroke="#fff"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};
