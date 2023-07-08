import { axis, path, plot, polar } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";
import { Fragment } from "react";

const plot1 = plane([
  axis("x"),
  axis("y").hide("zero"),
  plot("f(x) = 1/x").sampled(100),
]).margin(10, 10).size(300,300).figure();

export const Plot1 = () => {
  return <Figure of={plot1} />;
};

const plot2 = plane([
  polar("s(t) = cos(t) * sin(t)"),
]).margin(10, 10).size(300,300).figure();

export const Plot2 = () => {
  return <Figure of={plot2} />;
};
