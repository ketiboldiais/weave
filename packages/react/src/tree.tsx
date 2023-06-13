import {
  LineNode,
  TreeSpaceNode,
  label,
} from "@weave/twill";
import { Label, Tex } from "./label";
import { Fragment } from "react";
import { Arrow } from "./arrow";

export const Tree = ({ of }: { of: TreeSpaceNode }) => {
  const { nodes, edges, edgeNotes } = of.figure();
  const xs = of.scaleOf("x");
  const ys = of.scaleOf("y");
  const t = (x: number, y: number) =>
    `translate(${xs(x)},${ys(y)})`;
  const definitions = of.definitions;
  return (
    <g>
      <defs>
        {definitions.map((a) => (
          <Arrow key={a.id} of={a} />
        ))}
      </defs>

      <g>
        {edges.map((e) => (
          <g key={e.id}>
            <Line
              of={e
                .start(xs(e.x1), ys(e.y1))
                .end(xs(e.x2), ys(e.y2))}
            />
          </g>
        ))}
      </g>
      <g>
        {edgeNotes.map((e) => (
          <g key={e.id}>
            <Line
              of={e
                .start(xs(e.x1), ys(e.y1))
                .end(xs(e.x2), ys(e.y2))}
            />
          </g>
        ))}
      </g>
      <g>
        {nodes.map((n) => (
          <g key={n.id} transform={t(n.cx, n.cy)}>
            <circle
              r={n.r}
              stroke={n.strokeColor || "currentColor"}
              strokeWidth={n.strokeWidth || 1}
              fill={n.fillColor || "white"}
            />
            {/* <Label of={n} position={`translate(0,15)`} /> */}
            <Label
              of={label(n.content)}
              position={`translate(0,15)`}
            />
          </g>
        ))}
      </g>
    </g>
  );
};

const Line = ({ of }: { of: LineNode }) => {
  return (
    <line
      id={of.id}
      x1={of.x1}
      x2={of.x2}
      y1={of.y1}
      y2={of.y2}
      stroke={of.strokeColor || "currentColor"}
      strokeWidth={of.strokeWidth ? of.strokeWidth : 1}
      strokeDasharray={of.strokeDashArray || 0}
      opacity={of.opacityValue || 1}
      markerEnd={`url(#${of.id})`}
      // markerStart={`url(#${of.id})`}
    />
  );
};
