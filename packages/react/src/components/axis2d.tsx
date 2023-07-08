import { useMemo } from "react";
import { Axis, TextNode } from "@weave/loom";
import { Label } from "./label";
import { L } from "./line";

type Axis2DProps = {
  of: Axis;
};
export const Axis2D = ({ of }: Axis2DProps) => {
  const domain = of.domain();
  const range = of.range();
  const tickLength = of.TickLength;
  const isX = of.is("x");
  if (of.direction === "polar") {
    const rticks = of.radialAxes();
    const ticks = of.polarAxisTicks();
    return (
      <g>
        <g>
          {rticks.map((c, i) => (
            <circle
              key={`circ-${i}-${c.type}-${c.x}`}
              r={c.r}
              cx={c.x}
              cy={c.y}
              stroke={c.strokeColor || "currentColor"}
              strokeDasharray={c.strokeDashArray || 0}
              fill={"none"}
            />
          ))}
        </g>
        {ticks.map((tick) => <L of={tick} noscale />)}
      </g>
    );
  }
  const ticks = useMemo(() => {
    return of.tickData();
  }, [domain.join("-"), range.join("-")]);
  const translation = (
    text: TextNode,
    other: number = 0,
    dx: number = 0,
    dy: number = 0,
  ) => {
    if (isX) {
      return `translate(${text.x + dx}, ${other + dy})`;
    }
    return `translate(${0 + dx}, ${text.y + dy})`;
  };
  const rotate = isX ? "rotate(0)" : "rotate(90)";
  const translateXY = of.translationXY();
  return (
    <g transform={translateXY}>
      <g transform={rotate} opacity={of.opacityValue || 0.4}>
        {!of.hasNo("axis-line") && (
          <path
            d={of.axisLine()}
            fill={"none"}
            stroke={of.strokeColor || "currentColor"}
            strokeDasharray={of.strokeDashArray || 0}
          />
        )}
      </g>
      {!of.hasNo("ticks") &&
        ticks.map(({ text, line }, i) => (
          <g key={(text.text as any) + i} opacity={of.opacityValue || 0.4}>
            <line
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke={line.strokeColor || "currentColor"}
            />
            <text
              x={text.x}
              y={text.y}
              fontSize={"7px"}
              color={text.FontColor || "currentColor"}
              textAnchor={text.anchor||'start'}
            >
              {text.text}
            </text>
            
          </g>
        ))}
    </g>
  );
};
