import { forceSpace, graph } from "@weave/loom";
import { Figure } from "../components/figure.js";

const d = forceSpace(graph({
  a: ["b", 'x', 'n'],
  b: ["c", "d"],
  c: ["e", 'g'],
})).w(200).h(200).x(-5,5).y(-5,5).figure();

export const ForceGraph1 = () => {
  return <Figure of={d} />;
};