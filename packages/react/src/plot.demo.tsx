import {
  axis,
  line,
  path,
  plot,
  polygon,
  ray,
  tex,
  vector,
} from "@weave/twill";

import { Figure } from "./figure";

import { plane } from "@weave/twill";
const a = vector(1, 1);
const b = vector(2, 2);
const plot1 = plane([
  axis("x"),
  axis("y"),
  path([0,0])
    .M([0,1])
    .M([2,2])
    .M([3,3])
    .z()
])
  .domain([-10, 10])
  .range([-10, 10])
  .gridlines("xy")
  .figure();

export const Plot = () => {
  return <Figure of={plot1} />;
};
