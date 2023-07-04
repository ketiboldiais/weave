import { axis, plot, polar } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";
import { Fragment } from "react";

const plot1 = plane([
  axis("x").ticks(11),
  axis("y").ticks(11).hide("zero"),
  plot("f(x) = 1/x").sampled(100),
]).margin(10, 10).w(300).h(300).figure();

export const Plot1 = () => {
  return <Figure of={plot1} />;
};

const plot2 = plane([
  polar("s(t) = cos(t) * sin(t)"),
]).margin(10, 10).w(300).h(300).gridlines("xy").figure();

export const Plot2 = () => {
  return <Figure of={plot2} />;
};
