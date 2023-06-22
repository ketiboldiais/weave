import { label, TreeSpace } from "@weave/twill";
import { Label } from "./label";
import { Arrow } from "./arrow";
import { L } from './line';


export const Tree = ({ of }: { of: TreeSpace }) => {
  const { nodes, edges, edgeNotes } = of.figure();
  // const nodes = of.children.nodes;
  // const edges = of.children.edges;
  // const edgeNotes = of.children.edgeNotes;
  const definitions = of.definitions;
  return (
    <g>
      <defs>
        {definitions.map((a) => <Arrow key={a.id} of={a} />)}
      </defs>
      <g>
        {edges.map((e) => (
          <g key={e.id}>
            <L of={e} />
          </g>
        ))}
      </g>
      <g>
        {edgeNotes.map((e) => (
          <g key={e.id}>
            <L of={e} />
          </g>
        ))}
      </g>
      <g>
        {nodes.map((n) => (
          <g key={n.id} transform={n.pxy}>
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

