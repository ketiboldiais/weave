import { axis, circle, matrix, plot } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";
const plot1 = plane([
  axis("x"),
  axis("y"),
  circle(1).transform(m => [[1,0,100], [0,1,-30]]),
]).figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
