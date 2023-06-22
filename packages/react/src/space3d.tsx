import {
  Axis3D,
  isAxis3D,
  isLine,
  isPoint3D,
  Point3D,
  Ray,
  Space3D,
} from "@weave/twill";
import { Fragment } from "react";
import { Arrow } from "./arrow";
import { L } from './line';

export const Space3 = ({ of }: { of: Space3D }) => {
  const children = of.children;
  const definitions = of.definitions;
  return (
    <g>
      <defs>
        {definitions.map((a, i) => <Arrow key={"arrow" + a.id + i} of={a} />)}
      </defs>
      {children.map((v) => (
        <Fragment key={v.id}>
          {isPoint3D(v) && <Circ3 of={v} />}
          {isAxis3D(v) && <Axis3d of={v} />}
          {isLine(v) && <L of={v} />}
        </Fragment>
      ))}
    </g>
  );
};

export const Axis3d = ({ of }: { of: Axis3D }) => {
  return (
    <g className={`axis3d-${of.direction}`} transform={of.translate()}>
      <g transform={of.rotation()}>
        <path
          d={of.path()}
          fill={"none"}
          stroke={of.strokeColor || "currentColor"}
          markerEnd={`url(#${of.id})`}
        />
      </g>
    </g>
  );
};

type Point3DProps = {
  of: Point3D;
};
export const Circ3 = ({ of }: Point3DProps) => {
  const c = of.circle();
  return (
    <g transform={`translate(${c.x},${c.y})`}>
      <circle
        r={3}
        stroke={c.strokeColor || "currentColor"}
        fill={c.fillColor || "currentColor"}
      />
    </g>
  );
};

type Ray3DProps = { of: Ray };
export const Ray3D = ({ of }: Ray3DProps) => {
  const sp = of.space();
  const xs = sp.scaleOf("x");
  const ys = sp.scaleOf("y");
  const x1 = xs(of.o.x);
  const y1 = ys(of.o.y);
  const x2 = xs(of.d.x);
  const y2 = ys(of.d.y);
  return (
    <Fragment>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={"currentColor"}
        markerEnd={`url(#${of.id})`}
      />
    </Fragment>
  );
};
