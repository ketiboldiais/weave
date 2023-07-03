import { Path } from "@weave/twill";

export const Path2D = ({ of }: { of: Path }) => {
  const d = of.d();
  return (
    <path
      d={d}
      stroke={of.strokeColor || "currentColor"}
      fill={of.fillColor || "none"}
      strokeWidth={of.strokeWidth || 1}
      strokeDasharray={of.strokeDashArray || 0}
      opacity={of.opacityValue || 1}
    />
  );
};
