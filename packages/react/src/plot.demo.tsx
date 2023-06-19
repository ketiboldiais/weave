import { angle, arc, axis, carc, circle, ray, toRadians } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const r1 = ray([0, 0], [1, 0]);

const plot1 = plane([
  axis("x"),
  axis("y"),
  circle(1).fill('none').stroke('lightgrey'),
  angle(45, "deg").stroke("firebrick").weight(1.2),
])
  .domain([-2, 2])
  .range([-2, 2])
  .gridlines("xy")
  .figure();

const plot2 = plane([
  axis("x"),
  axis("y"),
]).domain([-5, 5]).range([-5, 5]).figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
      {/* <Figure of={plot2} /> */}
    </Fragment>
  );
};
