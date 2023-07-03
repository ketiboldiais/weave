import { leaf, Line, subtree, tree } from "@weave/loom";

import { Figure } from "../components/figure";

const redline = (line: Line) => line.stroke("red");
const tree1 = tree("1").nodes([
  subtree("2").nodes([leaf("c"), leaf("9")]),
  subtree("3").nodes([leaf("e"), leaf("b")]),
]).ala('buccheim-unger-leipert').figure();

export const Tree = () => {
  return <Figure of={tree1} />;
};
