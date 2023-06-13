import { useMemo } from "react";
import { AxisNode, TextNode } from "@weave/twill";
import { Label } from "./label";

type Axis2DProps = {
  of: AxisNode;
};
export const Axis2D = ({ of }: Axis2DProps) => {
  const domain = of.domain();
  const range = of.range();
  const tickLength = of.TickLength;
  const isX = of.is("x");
  const ticks = useMemo(() => {
    return of.axisTicks();
  }, [domain.join("-"), range.join("-")]);
  const translation = (
    text: TextNode,
    other: number = 0,
    dx: number = 0,
    dy: number = 0
  ) => {
    if (isX) {
      return `translate(${text.cx + dx}, ${other + dy})`;
    }
    return `translate(${0 + dx}, ${text.cy + dy})`;
  };
  const rotate = isX ? "rotate(0)" : "rotate(90)";
  const translateXY = of.translationXY();
  return (
    <g transform={translateXY}>
      <g transform={rotate} opacity={of.opacityValue||0.3}>
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
            stroke={of.strokeColor||'currentColor'}
            strokeDasharray={of.strokeDashArray||0}
          />
        )}
      </g>
      {!of.hasNo("ticks") &&
        ticks.map((text) => (
          <g key={text.id} opacity={of.opacityValue||0.5}>
            <line
              y1={-tickLength}
              y2={tickLength}
              stroke={text.FontColor||'currentColor'}
              transform={translation(text) + " " + rotate}
            />
            <Label
              of={text}
              anchor={
                text.anchor
                  ? text.anchor
                  : isX
                  ? "middle"
                  : "end"
              }
              position={translation(
                text,
                20,
                isX ? 0 : -10,
                isX ? 0 : 3
              )}
            />
          </g>
        ))}
    </g>
  );
};
