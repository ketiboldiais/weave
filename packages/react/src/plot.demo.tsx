import { axis, color, path } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const line = (
  start: number[],
  end: number[],
) => (path(start[0], start[1]).L(end[0], end[1]));

const c1 = color("thistle");
const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
