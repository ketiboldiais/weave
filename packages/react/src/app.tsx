import { tree, subtree, leaf } from "@weave/twill";
import { Figure } from "./figure";

const bleft = subtree("5").nodes([leaf("7"), leaf("8")]);

const tree1 = tree("1").nodes([
  subtree("2").nodes([leaf("4"), leaf('2j'), leaf('7m'), leaf('2e')]),
  subtree("3").nodes([bleft, leaf('8a'), leaf('8b')]),
]);
tree1.ala('wetherell-shannon');
tree1.gridlines("xy");
// tree1.edges("postorder", (l) => l.stroke("blue").weight(3));
tree1.axis("x");
tree1.axis("y");

const Tree = () => {
  return <Figure of={tree1} />;
};

export const App = () => {
  return (
    <div>
      <Tree />
    </div>
  );
};
