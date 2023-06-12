import { Fragment } from "react";
import { PlaneNode } from "@weave/twill";
import { isAxis } from "@weave/twill";
import { isPlot } from "@weave/twill";
import { isTextNode } from "@weave/twill";
import { Label } from "./label";
import { Curve2D } from "./curve2d";
import { Axis2D } from "./axis2d";


type Plane2DProps = {
  of: PlaneNode;
};
export const Plane2D = ({ of }: Plane2DProps) => {
  const children = of.children();
  return (
    <g>
      {children.map((c) => (
        <Fragment key={c.id}>
          {isAxis(c) && <Axis2D of={c} />}
          {isPlot(c) && <Curve2D of={c} />}
          {isTextNode(c) && <Label of={c} />}
        </Fragment>
      ))}
    </g>
  );
};
