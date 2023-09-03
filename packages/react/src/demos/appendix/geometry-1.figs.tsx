import { circle, line, plane, text } from "../../loom";
import { Figure } from "../Screen";

const brown = "#7D7463";

export const LineSegment1 = () => {
  const d = plane([-5, 5], [-5, 5])
    .margins(100, 100)
    .width(600)
    .height(600)
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([-1, 1], [1, -1]).stroke("firebrick").strokeWidth(2),
      circle(0.25).at(-1, 1).fill("tomato").stroke("none"),
      circle(0.25).at(1, -1).fill("tomato").stroke("none"),
      text("A").at(-1, 1.6).mode("LaTeX").fontColor("white"),
      text("B").at(1, -1.3).mode("LaTeX").fontColor("white"),
    )
    .end();
  return <Figure of={d} />;
};

export const Ray1 = () => {
  const d = plane([-5, 5], [-5, 5])
    .margins(100, 100)
    .width(600)
    .height(600)
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([-1, 1], [1, -1]).stroke("tomato").arrowEnd().strokeWidth(2),
      circle(0.25).at(-1, 1).fill("tomato").stroke("none"),
      circle(0.25).at(0, 0).fill("tomato").stroke("none"),
      text("A").at(-1, 1.6).mode("LaTeX").fontColor("white"),
      text("B").at(0.25, 0.6).mode("LaTeX").fontColor("white"),
    )
    .end();
  return <Figure of={d} />;
};

export const Line1 = () => {
  const d = plane([-5, 5], [-5, 5])
    .margins(100, 100)
    .width(600)
    .height(600)
    .axisColor(brown)
    .axis("x")
    .axis("y")
    .and(
      line([-3,3], [3,-3]).stroke("tomato")
        .arrowEnd()
        .arrowStart()
        .strokeWidth(2),
      circle(0.25).at(-1, 1).fill("tomato").stroke("none"),
      circle(0.25).at(0, 0).fill("tomato").stroke("none"),
      circle(0.25).at(1, -1).fill("tomato").stroke("none"),
      text("A").at(-1, 1.6).mode("LaTeX").fontColor("white"),
      text("B").at(0.25, 0.5).mode("LaTeX").fontColor("white"),
      text("C").at(1.25, -0.6).mode("LaTeX").fontColor("white"),
    )
    .end();
  return <Figure of={d} />;
};
