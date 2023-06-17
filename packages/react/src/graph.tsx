import { Eades } from "@weave/twill";
import { Line } from "./tree";

export const SpringGraph = ({ of }: { of: Eades }) => {
  const nodes: any[] = of.vertices();
  const edges = of.edges();
  const translate = (
    x: number, 
    y: number
  ) => `translate(${x},${y})`;
  console.log({ nodes, edges });
  return (
    <g>
      {edges.map((line, i) => (
        <g key={of.id + "spring" + i}>
          <Line of={line} noscale />
        </g>
      ))}
      {nodes.map((mass, i) => (
        <g key={of.id + "mass" + i} transform={translate(mass.x, mass.y)}>
          <circle
            r={mass.r}
            fill={mass.fillColor || "white"}
            stroke={mass.strokeColor || "currentColor"}
            strokeWidth={mass.strokeWidth || 1}
            strokeDasharray={mass.strokeDashArray || 0}
          />
          <text
            fontFamily={"system-ui"}
            fontSize={"12px"}
            fill={"firebrick"}
            dy={-8}
          >
            {mass.label}
          </text>
        </g>
      ))}
    </g>
  );
};
