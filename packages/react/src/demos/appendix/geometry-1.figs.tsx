import { circle, line, plane } from "../../loom";
import { Figure } from "../Screen";

export const Fig1 = () => {
  const d = plane([-5, 5], [-5, 5]).width(600).height(600).axisColor("white")
    .axis("x")
    .axis("y")
    .and(
      line([-1, 1], [1, -1]).stroke("tomato").strokeWidth(2),
      circle(0.25).at(-1, 1).fill("white"),
      circle(0.25).at(1, -1).fill("white"),
    )
    .end();
  return <Figure of={d} />;
};
