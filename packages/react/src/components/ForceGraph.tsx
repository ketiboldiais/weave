import { ForceSpace, isAxis } from "@weave/loom";
import { Fragment } from "react";
import { Axis2D } from "./axis2d";

export const ForceGraph = ({ of }: { of: ForceSpace }) => {
  const children = of.children;
  const vertices = of.vertices();
  const edges = of.edges();
  return (
    <Fragment>
      {children.map((n,i) => (
        <Fragment key={`graph-axis-${i}`}>
          {isAxis(n) && <Axis2D of={n} />}
        </Fragment>
      ))}
      {edges.map((e) => (
        <g key={e.id} id={e.id as any}>
          <line
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={"grey"}
            strokeWidth={1}
          />
        </g>
      ))}
      {vertices.map((v) => (
        <g key={v.id} transform={`translate(${v.p.x},${v.p.y})`}>
          <circle r={2} fill={"tomato"} stroke={"currentColor"} />
          <text
            fontFamily={"system-ui"}
            fontSize={"8px"}
            fill={"currentColor"}
            dy={-5}
          >
            {v.id}
          </text>
        </g>
      ))}
    </Fragment>
  );
};
