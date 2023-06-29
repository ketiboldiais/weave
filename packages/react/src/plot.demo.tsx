import { axis, circle, color, matrix, path, plot, rect, rgb } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const c1 = color('thistle');
const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  path([0, 0]).L(1, 2).H(3).L(2, 0).Z().fill(c1),
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
