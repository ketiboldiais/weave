import { axis, color, plane, quad, space } from "@weave/loom";
import { Figure } from "../components/figure";

const rects = plane([
  axis("x"),
  axis("y"),
  [
    quad(1, 1).at(0, 1),
    quad(1, 2).at(1, 2),
    quad(1, 4).at(2, 4),
    quad(1, 1).at(3, 1),
    quad(1, 2.5).at(4, 2.5),
  ].map((q) => q.fill(color("beige")).stroke(color("goldenrod"))),
]).context(space(500,300).margin(50,100).dom(0,5).ran(0,5)).figure();

export const Quad1 = () => <Figure of={rects} />;
