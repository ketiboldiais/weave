import { axis, rect, circ, color, matrix, path, plot, rgb } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";


const c1 = color("thistle");
const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  rect(3,2,[2,2]),
  circ(.1,[2,2]).fill('red'),
  // path().L(2,0).L(2,1).L(0,1).L(0,0),
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};


