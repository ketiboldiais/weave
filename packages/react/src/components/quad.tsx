import { Quad } from "@weave/loom";

export const Rect = ({ of }: { of: Quad }) => {
  return (
    <rect
      x={of.x}
      y={of.y}
      width={of.W}
      height={of.H}
      fill={of.fillColor || "none"}
      stroke={of.strokeColor || "currentColor"}
    />
  );
};
