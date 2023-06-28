import { axis, circle, matrix, path, plot, rect } from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";
import { Fragment } from "react";
const plot1 = plane([
  axis("x"),
  axis("y"),
  path([0, 0])
    .L([5, 0])
    .L([5, 5])
    .Z()
    .rotate("45deg"),
]).gridlines("xy").figure();

export const Plot = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
