import { CircleNode, linearScale } from "@weave/twill";
import { useMemo } from "react";

export const Circle = ({
  of,
  shift,
  radius,
}: {
  of: CircleNode;
  shift?: string;
  radius?: number;
}) => {
  const data = useMemo(() => {
    const space = of.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const max = (space.xmax() - space.xmin()) / 2;
    const rs = linearScale([0, max], [0, space.boxed('width')/2]);
    const r = radius !== undefined ? radius : rs(of.r);
    const translate = shift ? shift : `translate(${xs(of.x)}, ${ys(of.y)})`;
    return { r, translate };
  }, [of.id]);
  return (
    <g transform={data.translate}>
      <circle
        r={data.r}
        fill={of.fillColor || "white"}
        stroke={of.strokeColor || "currentColor"}
        strokeWidth={of.strokeWidth || 1}
        strokeDasharray={of.strokeDashArray || 0}
      />
    </g>
  );
};
