import { circle, plane } from "@weave/loom";
import { Figure } from "../components/figure";
import {interpolator} from '@weave/math';
const r = 10;
const lf = interpolator([0,1], [0,250])
const c = circle(lf(1));
const p = plane([
  c,
]).x(-r,r).y(-r,r).figure();
export const PolarAxis = () => {
  return <Figure of={p} />;
};
