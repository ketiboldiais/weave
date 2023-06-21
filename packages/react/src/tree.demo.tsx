import {
  leaf,
  Line,
  subtree,
  tree,
} from "@weave/twill";

import { Figure } from "./figure";

const redline = (line: Line) => line.stroke("red");
const bleft = subtree("5")
  .nodes([leaf("7"), leaf("y"), leaf("8")]);
const cleft = subtree("4")
  .nodes([leaf("g"), leaf("j"), leaf("i")]);
const tree1 = tree("1").nodes([
  subtree("2").nodes([cleft, leaf("9")]),
  subtree("3").nodes([bleft, leaf("b")]),
]).ala("buccheim-unger-leipert").gridlines('xy');
export const Tree = () => {
  return <Figure of={tree1} />;
};
