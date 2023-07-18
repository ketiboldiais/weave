import {
  bst,
  color,
  leaf,
  Line,
  line,
  space,
  subtree,
  tree,
  TreeChild,
} from "@weave/loom";
import { Figure } from "../components/figure";

const tree1 = tree("a").nodes([
  subtree("d").nodes([leaf("g"), leaf("j"), leaf("l"), leaf("m")]),
  subtree("c").nodes([leaf("f"), leaf("i")]),
  subtree("b").nodes([leaf("e"), leaf("h"), leaf("k")]),
]).context(space(300,200).dom(-6,6).ran(-2,0)).ala("buccheim-unger-leipert").figure();

export const Tree1 = () => {
  return <Figure of={tree1} />;
};

const greenline = (
  l: Line,
) => l.stroke(color("seagreen")).weight(1.2);
const bst1 = bst([10, 6, 15, 3, 8, 20])
  .id((d) => d)
  .draw()
  .nodemap((n) => n.fill("wheat"))
  .edgemap((l) => l.stroke("brown"))
  .edges("bfs", greenline)
  .context(space(300,200).dom(-2,2).ran(-2,0).size(300,220))
  .ala("reingold-tilford")
  .figure();

export const Tree2 = () => {
  return <Figure of={bst1} />;
};

const bst2 = bst([25, 20, 10, 22, 5, 12, 28, 36, 30, 40, 38, 48])
  .id((d) => d)
  .draw()
  .nodemap((n) => n.fill("lavender").stroke("blueviolet"))
  .edgemap((l) => l.stroke("blueviolet"))
  .context(space(450,250).dom(-8,4).ran(-2,3).size(450,250))
  .ala("hv")
  .figure();

export const Tree3 = () => {
  return <Figure of={bst2} />;
};
