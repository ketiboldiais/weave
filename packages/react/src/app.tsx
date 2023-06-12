import { Figure } from "./figure";
import { axis, leaf, subtree, tree } from "@weave/twill";

const fig = tree("a").nodes([
  subtree("b").nodes([leaf("c"), leaf("d")]),
  subtree("e").nodes([
    subtree("f").nodes([leaf("g"), leaf("h")]),
    subtree("h").nodes([leaf("i"), leaf("j")]),
  ]),
]);
fig.ala("wetherell-shannon");
fig.nodemap("bfs", (node) =>
  node.fill("lightgrey")
);
fig.gridlines("xy");
fig.onPath("threads");

const Knuth = () => {
  return <Figure of={fig} />;
};

export const App = () => {
  return (
    <div>
      <Knuth />
    </div>
  );
};
