import {
  angle,
  axis,
  circle,
  line,
  matrix,
  plot,
  polar,
  polygon,
  ray,
  rect,
  vector,
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
  rect(1,0.5)
]).figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
      {/* <Figure of={plot2} /> */}
    </Fragment>
  );
};
