import { Fragment } from "react";
import { PlotNode } from "@weave/twill";
import { isIntegral } from "@weave/twill";
import { Integration } from "./integration";

type Curve2DProps = {
  of: PlotNode;
};
export const Curve2D = ({ of }: Curve2DProps) => {
  const d = of.path();
  const hasChildren = of.children.length !== 0;
  return (
    <Fragment>
      <g>
        <path
          d={d}
          fill={of.fillColor || "none"}
          stroke={of.strokeColor || "tomato"}
          strokeWidth={of.strokeWidth || 1}
        />
      </g>
      {hasChildren &&
        of.children.map((c) => (
          <Fragment key={c.id}>
            {isIntegral(c) && <Integration of={c} />}
          </Fragment>
        ))}
    </Fragment>
  );
};
