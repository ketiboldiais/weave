import {
  angle,
  arrow,
  axis,
  circle,
  line,
  matrix,
  plot,
  polar,
  polygon,
  ray,
  rect,
  v2,
  vector,
  vray,
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
const A = v2(-5,7);
const B = v2(-1,8);
const plot1 = plane([
  axis("x"),
  axis("y"),
  vray(A),
  // polar('f(t) = sin(t^2)'),
  // plot('f(t) = log(t)'),
]).figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
      {/* <Figure of={plot2} /> */}
    </Fragment>
  );
};
