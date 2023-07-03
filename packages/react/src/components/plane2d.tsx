import { Fragment } from "react";
import {
  isAxis,
  isCircle,
  isLine,
  isPath,
  isPlot,
  isTextNode,
  Plane,
} from "@weave/loom";
import { Label } from "./label";
import { Curve2D } from "./curve2d";
import { Axis2D } from "./axis2d";
import { C } from "./circle";
import { Arrow } from "./arrow";
import { L } from "./line";
import { Path2D } from "./path";

type Plane2DProps = {
  of: Plane;
};
export const Plane2D = ({ of }: Plane2DProps) => {
  const children = of.nodes;
  const definitions = of.definitions;
  return (
    <Fragment>
      <defs>
        {definitions.map((a, i) => <Arrow key={"arrow" + a.id + i} of={a} />)}
      </defs>
      {children.map((c,i) => (
        <Fragment key={`plane2d-${i}`}>
          {isAxis(c) && <Axis2D of={c} />}
          {isPlot(c) && <Curve2D of={c} />}
          {isTextNode(c) && <Label of={c} />}
          {isCircle(c) && <C of={c} />}
          {isLine(c) && <L of={c} />}
          {isPath(c) && <Path2D of={c} />}
        </Fragment>
      ))}
    </Fragment>
  );
};

