import { graph, eades } from "@weave/twill";
import { Figure } from "./figure.js";

const d = eades(graph({
  a: ["b"],
  b: ["c", "d"],
  c: ["d", "f"],
  f: ['a'],
  d: ["f"],
}))
// d.start();

export const GraphDemo = () => {
  // return <Figure of={d} />;
  return <></>;
};
