import { Line } from "@weave/loom";

export const L = ({ of, noscale }: { of: Line; noscale?: boolean }) => {
  return (
    <line
      x1={of.x1}
      y1={of.y1}
      x2={of.x2}
      y2={of.y2}
      stroke={of.strokeColor || "currentColor"}
      strokeWidth={of.strokeWidth ? `${of.strokeWidth}px` : `1px`}
      strokeDasharray={of.strokeDashArray || 0}
      opacity={of.opacityValue || 1}
      markerEnd={`url(#${of.id})`}
    />
  );
};
