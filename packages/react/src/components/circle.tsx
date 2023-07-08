import { Circle } from "@weave/loom";

export const C = ({ of }: { of: Circle }) => (
  <circle
    r={of.r}
    cx={of.x}
    cy={of.y}
    fill={of.fillColor || "none"}
    stroke={of.strokeColor || "currentColor"}
    strokeWidth={of.strokeWidth || 1}
    strokeDasharray={of.strokeDashArray || 0}
  />
);
