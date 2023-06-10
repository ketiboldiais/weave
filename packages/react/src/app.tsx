import {
  axis,
  integral,
  latex,
  leaf,
  LineNode,
  plane,
  plot,
  subtree,
  tree,
} from "@weave/twill";
import { Figure } from "./figure";
import css from "./app.module.scss";

const PlotTest = () => {
  const fig = plane([
    plot("g(x) = x^2"),
    latex("h(x) = x^2").at([5, 5]),
    plot("f(x) = cos(x)").and(integral([-5, 5])),
    axis("x"),
    axis("y"),
  ]).gridlines("xy");
  return <Figure of={fig} />;
};

const gridfn = (line: LineNode) => {
  if (line.x1 === 0 || line.y1 === 0) {
    return line.stroke("red");
  } else return line;
};

const Tilford = () => {
  const left = subtree('b')
    .leaf('c')
    .node(
      subtree('d')
        .leaf('e')
        .leaf('f')
    )
  const right = leaf('g')
  const tree1 = tree('a').nodes([left, right])
  tree1.ala('reingold-tilford');
  tree1.nodemap((n) => n.fill("lightgrey"));
  tree1.domain([-8, 8]);
  tree1.range([-8, 8]);
  tree1.size(500, 500);
  tree1.margin(0, 0);
  tree1.gridlines("xy", gridfn);
  tree1.annotate('threads');
  return <Figure of={tree1} />;
};
const WetherellShannon1 = () => {
  const left = subtree(2).leaf(4);
  const subright = subtree(5).leaf(7).leaf(8);
  // const right = subtree(3).branch([subright, leaf(6)]);
  const tree1 = tree(1).nodes([]);
  // tree1.ala("wetherell-shannon");
  // tree1.nodemap((n) => n.fill("lightgrey"));
  // tree1.domain([-8, 8]);
  // tree1.range([-8, 8]);
  // tree1.size(300, 300);
  // tree1.margin(0, 0);
  // tree1.gridlines("xy", gridfn);
  // tree1.annotate("postorder-traversal");
  return <Figure of={tree1} />;
};

const KnuthTree = () => {
  const left = subtree(2).leaf(4);
  const subright = subtree(5).leaf(7).leaf(8);
  // const right = subtree(3).children([subright, leaf(6)]);
  const tree1 = tree(1).nodes([]);
  tree1.ala("knuth");
  tree1.nodemap((n) => n.fill("lightgrey"));
  tree1.domain([-8, 8]);
  tree1.range([-8, 8]);
  tree1.size(300, 300);
  tree1.margin(0, 0);
  tree1.gridlines("xy", gridfn);
  tree1.annotate("postorder-traversal");
  return <Figure of={tree1} />;
};

export const App = () => {
  return (
    // <div className={css.twocolumn}>
    <div>
      {/* <KnuthTree /> */}
      {/* <WetherellShannon1 /> */}
      <Tilford />
    </div>
  );
};
