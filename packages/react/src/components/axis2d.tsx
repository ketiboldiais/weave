import { useMemo } from "react";
import { Axis } from "@weave/loom";

type Axis2DProps = {
  of: Axis;
};
export const Axis2D = ({ of }: Axis2DProps) => {
  const domain = of.domain();
  const range = of.range();
  const isX = of.is("x");
  const ticks = useMemo(() => {
    return of.tickData();
  }, [domain.join("-"), range.join("-")]);
  const rotate = isX ? "rotate(0)" : "rotate(90)";
  const translateXY = of.translationXY();
  return (
    <g transform={translateXY}>
      <g transform={rotate} opacity={of.opacityValue || 0.5}>
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
          <g key={(text.text as any) + i} opacity={of.opacityValue || 0.6}>
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
              fontSize={"11px"}
              color={text.FontColor || "currentColor"}
              textAnchor={text.anchor || "start"}
            >
              {text.text}
            </text>
          </g>
        ))}
    </g>
  );
};
