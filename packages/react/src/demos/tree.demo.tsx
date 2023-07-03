import {
  bst,
  color,
  leaf,
  Line,
  line,
  subtree,
  tree,
  TreeChild,
} from "@weave/loom";
import { Figure } from "../components/figure";

const tree1 = tree("a").nodes([
  subtree("d").nodes([leaf("g"), leaf("j"), leaf("l"), leaf("m")]),
  subtree("c").nodes([leaf("f"), leaf("i")]),
  subtree("b").nodes([leaf("e"), leaf("h"), leaf("k")]),
])
  .x(-6, 6).y(-2, 0).w(300).h(200).ala("buccheim-unger-leipert").figure();

export const Tree1 = () => {
  return <Figure of={tree1} />;
};

const greenline = (
  l: Line
) => l.stroke(color("seagreen")).weight(1.2);
const bst1 = bst([10, 6, 15, 3, 8, 20])
  .id((d) => d)
  .draw()
  .edges("bfs", greenline)
  .x(-2, 2)
  .y(-2, 0)
  .w(250).h(200)
  .ala("reingold-tilford")
  .figure();

export const Tree2 = () => {
  return <Figure of={bst1} />;
};
