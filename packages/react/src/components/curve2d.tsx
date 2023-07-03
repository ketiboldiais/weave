import { Fragment } from "react";
import { Plot } from "@weave/loom";
import { isIntegral } from "@weave/loom";
import { Integration } from "./integration";

type Curve2DProps = {
  of: Plot;
};
export const Curve2D = ({ of }: Curve2DProps) => {
  const d = of.path();
  const hasChildren = of.children.length !== 0;
  return (
    <g transform={of.shift()}>
      <>
        <path
          d={d}
          fill={of.fillColor || "none"}
          stroke={of.strokeColor || "tomato"}
          strokeWidth={of.strokeWidth || 1}
        />
      </>
      {hasChildren &&
        of.children.map((c, i) => (
          <Fragment key={`fn-${i}-${d.slice(1, 3)}`}>
            {isIntegral(c) && <Integration of={c} />}
          </Fragment>
        ))}
    </g>
  );
};
