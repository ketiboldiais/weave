import { Fragment } from "react";
import {
  isAxis,
  isCircle,
  isLine,
  isPlot,
  isPolygon,
  isTextNode,
  PlaneNode,
  Polygon,
} from "@weave/twill";
import { Label } from "./label";
import { Curve2D } from "./curve2d";
import { Axis2D } from "./axis2d";
import { Circle } from "./circle";
import { Line } from "./tree";
import { Arrow } from "./arrow";

type Plane2DProps = {
  of: PlaneNode;
};
export const Plane2D = ({ of }: Plane2DProps) => {
  const children = of.nodes;
  const definitions = of.definitions;
  return (
    <g>
      <defs>
        {definitions.map((a, i) => <Arrow key={"arrow" + a.id + i} of={a} />)}
      </defs>
      {children.map((c) => (
        <Fragment key={c.id}>
          {isAxis(c) && <Axis2D of={c} />}
          {isPlot(c) && <Curve2D of={c} />}
          {isTextNode(c) && <Label of={c} />}
          {isCircle(c) && <Circle of={c} />}
          {isLine(c) && <Line of={c} />}
          {isPolygon(c) && <Poly of={c} />}
        </Fragment>
      ))}
    </g>
  );
};

export const Poly = ({ of }: { of: Polygon }) => {
  const d = of.path();
  return (
    <polygon
      points={d}
      stroke={of.strokeColor || "currentColor"}
      fill={of.fillColor || "none"}
      strokeDasharray={of.strokeDashArray||0}
      opacity={of.opacityValue||1}
      strokeWidth={of.strokeWidth||1}
    />
  );
};
