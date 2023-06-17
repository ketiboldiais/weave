import { axis, line, plot, polygon, tex, vector } from "@weave/twill";

import { Figure } from "./figure";

import { plane } from "@weave/twill";
const a = vector(1, 1);
const plot1 = plane([
  axis("x"),
  axis("y"),
]).domain([-5,5]).range([-5,5]).figure();

export const Plot = () => {
  return <Figure of={plot1} />;
};
