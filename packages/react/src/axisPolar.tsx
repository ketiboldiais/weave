import { PolarAxis } from "@weave/twill";
import { L } from "./line";
import { Fragment } from "react";

export const PolarAxis2D = ({ of }: { of: PolarAxis }) => {
  const rticks = of.radialAxes();
  const ticks = of.axisTicks();
  return (
    <g>
      <g>
        {rticks.map((c) => (
          <circle
            key={c.id}
            r={c.r}
            cx={c.x}
            cy={c.y}
            stroke={c.strokeColor || "currentColor"}
            strokeDasharray={c.strokeDashArray || 0}
            fill={"none"}
          />
        ))}
      </g>
      {ticks.map((tick) => (
        <Fragment key={tick.id}>
          <L of={tick} noscale />
        </Fragment>
      ))}
    </g>
  );
};
