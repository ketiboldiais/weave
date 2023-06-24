import { ForceGraph } from "@weave/twill";
import { L } from "./line";
import { Fragment } from "react";

export const SpringGraph = ({ of }: { of: ForceGraph }) => {
  const nodes = of.nodes;
  const lines = of.links;
  return (
    <g>
      {lines.map((line) => <L key={line.id} of={line.stroke('lightgrey')} noscale />)}
      {nodes.map((node) => (
        <g key={node.id} transform={`translate(${node.x},${node.y})`}>
          <circle
            r={2}
            stroke={"lightgrey"}
            fill={"white"}
          />
          <text fontSize={"10px"} fill={"red"}>
            {node.text}
          </text>
        </g>
      ))}
    </g>
  );
};
