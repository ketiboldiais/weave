import { Fragment } from "react";
import { Plot } from "@weave/twill";
import { isIntegral } from "@weave/twill";
import { Integration } from "./integration";

type Curve2DProps = {
  of: Plot;
};
export const Curve2D = ({ of }: Curve2DProps) => {
  const {d,t} = of.path();
  // const d = '';
  const hasChildren = of.children.length !== 0;
  // const translate = `translate(200,200)`
  return (
    <Fragment>
      <g transform={t}>
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
