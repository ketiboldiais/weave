import { leaf, Line, subtree, tree } from "@weave/loom";

import { Figure } from "../components/figure";

const redline = (line: Line) => line.stroke("red");

const tree1 = tree("a").nodes([
  subtree("d").nodes([leaf("g"), leaf("j"), leaf("l"), leaf("m")]),
  subtree("c").nodes([leaf("f"), leaf("i")]),
  subtree("b").nodes([leaf("e"), leaf("h"), leaf("k")]),
]).x(-6, 6).y(-2, 0).w(300).h(200).ala("buccheim-unger-leipert").figure();

export const Tree1 = () => {
  return <Figure of={tree1} />;
};


