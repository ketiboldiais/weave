import { Circle } from "@weave/loom";

export const C = ({ of }: { of: Circle }) => (
  <circle
    r={of.sr}
    cx={of.sx}
    cy={of.sy}
    fill={of.fillColor || "none"}
    stroke={of.strokeColor || "currentColor"}
    strokeWidth={of.strokeWidth || 1}
    strokeDasharray={of.strokeDashArray || 0}
  />
);
