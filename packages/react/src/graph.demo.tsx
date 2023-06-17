import { eades, graph } from "@weave/twill";
import { Figure } from "./figure";
const g = graph().link(1, 2).link(3,2)
const graph1 = eades(g).figure();

export const Graph = () => {
  return <Figure of={graph1} />;
};
