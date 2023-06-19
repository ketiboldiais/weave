import {
  Line,
  TreeSpace,
  label,
} from "@weave/twill";
import { Label } from "./label";
import { Arrow } from "./arrow";

export const Tree = ({ of }: { of: TreeSpace }) => {
  const { nodes, edges, edgeNotes } = of.figure();
  const xs = of.scaleOf("x");
  const ys = of.scaleOf("y");
  const t = (x: number, y: number) => `translate(${xs(x)},${ys(y)})`;
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
            <Line2D of={e}/>
          </g>
        ))}
      </g>
      <g>
        {edgeNotes.map((e) => (
          <g key={e.id}>
            <Line2D of={e}/>
          </g>
        ))}
      </g>
      <g>
        {nodes.map((n) => (
          <g key={n.id} transform={t(n.x, n.y)}>
            <circle
              r={n.r}
              stroke={n.strokeColor || "currentColor"}
              strokeWidth={n.strokeWidth || 1}
              fill={n.fillColor || "white"}
            />
            <Label
              of={label(n.text)}
              position={`translate(0,15)`}
            />
          </g>
        ))}
      </g>
    </g>
  );
};

export const Line2D = ({ of, noscale }: { of: Line, noscale?:boolean }) => {
  const space = of.space();
  const xs = noscale ? (x:number) => x : space.scaleOf('x');
  const ys = noscale ? (x:number) => x : space.scaleOf('y');
  return (
    <line
      x1={xs(of.x1)}
      y1={ys(of.y1)}
      x2={xs(of.x2)}
      y2={ys(of.y2)}
      stroke={of.strokeColor || "currentColor"}
      strokeWidth={of.strokeWidth ? of.strokeWidth : 1}
      strokeDasharray={of.strokeDashArray || 0}
      opacity={of.opacityValue || 1}
      markerEnd={`url(#${of.id})`}
    />
  );
};
