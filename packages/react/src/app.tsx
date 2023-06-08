import {
  axis,
  integral,
  latex,
  LineNode,
  plane,
  plot,
  subtree,
  tree,
} from "@weave/twill";
import { Figure } from "./figure";

const TreeTest = () => {
  const gridfn = (line: LineNode) => {
    if (line.x1 === 0 || line.y1 === 0) {
      return line.stroke("red");
    } else return line;
  };

  const fig = tree("17")
    .nodes([
      subtree("41")
        .leaf("29")
        .leaf("6"),
      subtree("9")
        .leaf("81")
        .leaf("40"),
    ]).gridlines("xy", gridfn).annotate("bfs-traversal").nodemap((n) =>
      n.fill('pink')
    );

  return <Figure of={fig} />;
};

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

export const App = () => {
  return (
    <div>
      <PlotTest />
      <TreeTest />
    </div>
  );
};
