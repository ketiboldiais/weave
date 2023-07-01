import {
  axis,
  circ,
  color,
  group,
  matrix,
  Path,
  path,
  plot,
  rect,
  rgb,
  tex,
} from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";

const mline = (length: number) => (line: Path) =>
  path(line.start.x, line.start.y)
    .L(line.end.x, line.end.y)
    .M(line.start.x, line.start.y + length)
    .v(-length * 2)
    .M(line.end.x, line.end.y + length)
    .v(-length * 2);
const linecap = mline(.2);
const lengthLabel = (line: Path) => [
  tex(
    line.start.euclideanDistance(line.end).toPrecision(1),
  ).p2D(line.start.mid2D(line.end).dy(.3)).font("size", "7px"),
  line,
];

const line = (
  start: number[],
  end: number[],
) => (path(start[0], start[1]).L(end[0], end[1]));

const c1 = color("thistle");
const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  lengthLabel(linecap(line([1, 4], [4, 4]))),
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
