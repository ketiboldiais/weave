import { Line } from "@weave/twill";

export const L = ({ of, noscale }: { of: Line; noscale?: boolean }) => {
  const space = of.space();
  const xs = noscale ? (x: number) => x : space.scaleOf("x");
  const ys = noscale ? (x: number) => x : space.scaleOf("y");
  return (
    <line
      x1={xs(of.x1)}
      y1={ys(of.y1)}
      x2={xs(of.x2)}
      y2={ys(of.y2)}
      stroke={of.strokeColor || "currentColor"}
      strokeWidth={of.strokeWidth ? `${of.strokeWidth}px` : `1px`}
      strokeDasharray={of.strokeDashArray || 0}
      opacity={of.opacityValue || 1}
      markerEnd={`url(#${of.id})`}
    />
  );
};
