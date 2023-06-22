import { Circle, linearScale } from "@weave/twill";
import { useMemo } from "react";

export const C = ({
  of,
  shift,
  radius,
}: {
  of: Circle;
  shift?: string;
  radius?: number;
}) => {
  const data = useMemo(() => {
    const space = of.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const r = of.scaledRadius;
    const translate = of.pxy;
    return { r, translate };
  }, [of.id]);
  return (
    <g transform={data.translate}>
      <circle
        r={data.r}
        fill={of.fillColor || "none"}
        stroke={of.strokeColor || "currentColor"}
        strokeWidth={of.strokeWidth || 1}
        strokeDasharray={of.strokeDashArray || 0}
      />
    </g>
  );
};
