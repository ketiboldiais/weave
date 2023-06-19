import {
  axis,
  circle,
  ray,
} from "@weave/twill";
import { Figure } from "./figure";
import { plane } from "@weave/twill";

const r1 = ray([0,0],[1,0]);
const plot1 = plane([
  axis("x").stroke('lightgrey'),
  axis("y").stroke('lightgrey'),
  r1,
  r1.rotate(45,'deg').dash(2),
  r1.rotate(85,'deg').dash(2),
  circle(1).fill('none').stroke('teal'),
])
  .domain([-2,2])
  .range([-2,2])
  .gridlines("xy")
  .figure();

export const Plot = () => {
  return <Figure of={plot1} />;
};
