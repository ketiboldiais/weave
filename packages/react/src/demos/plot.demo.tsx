import { axis, plot } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";
import { Fragment } from "react";

const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  plot('f(x) = (x^3) - 3'),
]).margin(10,10).w(300).h(300).gridlines("xy").figure();

export const Plot1 = () => {
  return (
    <Fragment>
      <Figure of={plot1} />
    </Fragment>
  );
};
