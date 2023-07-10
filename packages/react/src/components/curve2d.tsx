import { Plot } from "@weave/loom";

type Curve2DProps = {
  of: Plot;
};
export const Curve2D = ({ of }: Curve2DProps) => {
  const d = of.path();
  return (
    <g>
      <>
        <path
          d={d}
          fill={of.fillColor || "none"}
          stroke={of.strokeColor || "tomato"}
          strokeWidth={of.strokeWidth || 1}
        />
      </>
    </g>
  );
};
