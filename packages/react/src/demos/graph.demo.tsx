import { forceSpace, graph, space } from "@weave/loom";
import { Figure } from "../components/figure.js";

const d = forceSpace(graph({
  a: ["b", "x", "n"],
  b: ["c", "d", "g"],
  c: ["e", "g"],
  d: ["j", "k"],
  e: ["k"],
  j: ["x"],
  n: ["g"],
})).context(space(200,200).dom(-5,5).ran(-5,5)).figure();

export const ForceGraph1 = () => {
  return <Figure of={d} />;
};
