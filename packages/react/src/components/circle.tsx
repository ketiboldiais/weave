import { Circle } from "@weave/loom";
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
  return (
    <g>
      <circle
        r={of.sr}
        cx={of.sx}
        cy={of.sy}
        fill={of.fillColor || "none"}
        stroke={of.strokeColor || "currentColor"}
        strokeWidth={of.strokeWidth || 1}
        strokeDasharray={of.strokeDashArray || 0}
      />
    </g>
  );
};
