import { label, TreeSpace } from "@weave/loom";
import { Label } from "./label";
import { Arrow } from "./arrow";
import { L } from "./line";
import { Fragment } from "react";

export const Tree = ({ of }: { of: TreeSpace }) => {
  // of.figure();
  // const { nodes, edges, edgeNotes } = of.figure();
  const nodes = of.treenodes;
  const edges = of.links;
  const edgeNotes = of.notes;
  const definitions = of.definitions;
  return (
    <>
      <defs>
        {definitions.map((a) => <Arrow key={a.id} of={a} />)}
      </defs>
      <g className={"tree-edgenotes"}>
        {edgeNotes.map((e) => (
          <line
            key={e.id}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={"currentColor"}
          />
        ))}
      </g>
      <g className={"treelinks"}>
        {edges.map((e) => (
          <line
            key={e.id}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            stroke={"currentColor"}
          />
        ))}
      </g>
      <g className={"treenodes"}>
        {nodes.map((n) => (
          <Fragment key={n.id}>
            <circle
              r={n.r}
              cx={n.x}
              cy={n.y}
              stroke={n.strokeColor || "currentColor"}
              strokeWidth={n.strokeWidth || 1}
              fill={n.fillColor || "white"}
            />
            <Label
              of={label(n.text)}
              position={`translate(${n.x},${n.y - 8})`}
            />
          </Fragment>
        ))}
      </g>
    </>
  );
};
