import { tree, subtree, leaf, graph } from "@weave/twill";
import { Figure } from "./figure";

const bleft = subtree("5").nodes([
  leaf("7"),
  leaf("y"),
  leaf("8"),
]);
const cleft = subtree("4").nodes([
  leaf("g"),
  leaf("j"),
  leaf("i"),
]);
const tree1 = tree("1").nodes([
  subtree("2").nodes([cleft, leaf("9")]),
  subtree("3").nodes([bleft, leaf("b")]),
]);
tree1.ala("buccheim-unger-leipert");
tree1.gridlines("xy");

const Tree = () => {
  return <Figure of={tree1} />;
};

const g = graph({
  a: ["b", "d"],
  c: ["d", "i", "e"],
  j: ["c", "k", "o"],
}).gridlines('xy').figure();

const Graph = () => {
  return <Figure of={g} />;
};
export const App = () => {
  return (
    <div>
      <Graph />
    </div>
  );
};
