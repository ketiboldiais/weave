import { useMemo } from "react";
import { Axis, TextNode } from "@weave/loom";
import { Label } from "./label";
import {L} from './line';

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
          {rticks.map((c,i) => (
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
    return of.axisTicks();
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
            d={[
              "M",
              range[0],
              tickLength,
              "v",
              -tickLength,
              "H",
              range[1],
              "v",
              tickLength,
            ].join(" ")}
            fill={"none"}
            stroke={of.strokeColor || "currentColor"}
            strokeDasharray={of.strokeDashArray || 0}
          />
        )}
      </g>
      {!of.hasNo("ticks") &&
        ticks.map((text,i) => (
          <g key={text.text+i} opacity={of.opacityValue || 0.5}>
            <line
              y1={-tickLength}
              y2={tickLength}
              stroke={text.FontColor || "currentColor"}
              transform={translation(text) + " " + rotate}
            />
            <Label
              of={text}
              anchor={text.anchor ? text.anchor : isX ? "middle" : "end"}
              position={translation(
                text,
                20,
                isX ? 0 : -10,
                isX ? 0 : 3,
              )}
            />
          </g>
        ))}
    </g>
  );
};
