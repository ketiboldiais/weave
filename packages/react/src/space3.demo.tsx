import { matrix, ray, space3 } from "@weave/twill";
import { Figure } from "./figure.js";

const m = matrix([
  [2, 1],
  [-1, 2],
]);

const r = ray([1,1]);
const d = space3([
  // m.r3(),
  // m.transpose().r3(),
  // axis3("x"),
  // axis3("y"),
  // p3(r.p(3)),
  // p3(r.p(2)),
  // p3(r.p(1)),
  // p3(r.p(0)),
  // p3(r.p(-1)),
  // p3(r.p(-2)),
  // p3(r.p(-3)),
]).gridlines('xy').figure();

export const Space3Demo = () => {
  return <Figure of={d} />;
};
