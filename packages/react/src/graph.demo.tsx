import { axis, forceSpace, graph } from "@weave/twill";
import { L } from "./line";
import { Fragment } from "react";
import { Figure } from "./figure.js";

const d = forceSpace(graph({
  a: ['b'],
  b: ['c', 'd'],
  c: ['e']
}))
d.x(-5,5);
d.y(-5,5);
// d.and([axis("x"), axis("y")])
d.figure();

export const ForceGraph1 = () => {
  return <Figure of={d} />;
};
