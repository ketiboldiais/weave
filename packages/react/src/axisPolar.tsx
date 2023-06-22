import { PolarAxis } from "@weave/twill";
import { L } from './line';

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
            stroke={c.strokeColor || "currentColor"}
            strokeDasharray={c.strokeDashArray||0}
            fill={"none"}
          />
        ))}
      </g>
      {ticks.map((tick) => (
        <g key={tick.axisLine.id} transform={tick.rotate}>
          <L of={tick.axisLine} noscale />
        </g>
      ))}
    </g>
  );
};
