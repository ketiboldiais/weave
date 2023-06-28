import { label, TreeSpace } from "@weave/twill";
import { Label } from "./label";
import { Arrow } from "./arrow";
import { L } from './line';


export const Tree = ({ of }: { of: TreeSpace }) => {
  // of.figure();
  // const { nodes, edges, edgeNotes } = of.figure();
  const nodes = of.treenodes;
  const edges = of.links;
  const edgeNotes = of.notes;
  const definitions = of.definitions;
  return (
    <g>
      <defs>
        {definitions.map((a) => <Arrow key={a.id} of={a} />)}
      </defs>
      <g>
        {edges.map((e) => (
          <g key={e.id}>
            <L of={e}/>
          </g>
        ))}
      </g>
      <g>
        {edgeNotes.map((e) => (
          <g key={e.id}>
            <L of={e}/>
          </g>
        ))}
      </g>
      <g>
        {nodes.map((n) => (
          <g key={n.id}>
            <circle
              r={n.r}
              cx={n.sx}
              cy={n.sy}
              stroke={n.strokeColor || "currentColor"}
              strokeWidth={n.strokeWidth || 1}
              fill={n.fillColor || "white"}
            />
            <Label
              of={label(n.text).xy(n.x,n.y)}
              // position={`translate(${n.sx},${n.sy})`}
            />
          </g>
        ))}
      </g>
    </g>
  );
};

