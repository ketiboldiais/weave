import {
  axis,
  circle,
  matrix,
  plot,
  ray,
} from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const r1 = ray([0, 0], [1, 0]);
const mtx = matrix([
  [1, 2],
  [3, 1],
  [8, 2],
]);
const plot1 = plane([
  axis("x"),
  axis("y"),
  circle(1),
  plot("f(t) = cos(2t) * sin(2t)"),
  // angle("45deg").arm("70deg").opp().mark(),
])
  .domain([-2, 2])
  .range([-2, 2])
  // .gridlines("xy")
  .figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
      {/* <Figure of={plot2} /> */}
    </Fragment>
  );
};
