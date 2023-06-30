import { axis, circle, color, matrix, path, plot, rgb } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const c1 = color('thistle');
const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  path().L(2,1).L(2,3)
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
