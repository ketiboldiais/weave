import { axis, axis3, circle, matrix, p3, ray3, space3 } from "@weave/twill";
import { Figure } from "./figure.js";

const m = matrix([
  [2, 1],
  [-1, 2],
]);

// const r = ray3([0,0], [1,1]);
const d = space3([
  // m.r3(),
  // m.transpose().r3(),
  // r,
  axis3("x"),
  axis3("y"),
  // p3(r.p(3)),
  // p3(r.p(2)),
  // p3(r.p(1)),
  // p3(r.p(0)),
  // p3(r.p(-1)),
  // p3(r.p(-2)),
  // p3(r.p(-3)),
  // axis3("z"),
]).gridlines('xy').figure();

export const Space3Demo = () => {
  return <Figure of={d} />;
};
