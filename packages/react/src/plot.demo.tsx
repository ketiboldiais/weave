import { angle, arc, axis, circle, ray, toRadians } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const r1 = ray([0, 0], [1, 0]);

const plot1 = plane([
  axis("x"),
  axis("y"),
  circle(1).stroke('tomato'),
  arc(angle('45deg')).stroke('lightblue').weight(3),
  angle('45deg'),
  angle('134deg'),
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
