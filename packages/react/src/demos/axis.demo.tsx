import { axis, circle, path, plane, space } from "@weave/loom";
import { Figure } from "../components/figure";
import { cos, pi, sin } from "@weave/math";

const twopi = 2 * pi;
const fn = (t: number) => 1 + (cos(3 * t));
const f = () => {
  const out = path(0, 0);
  for (let i = 0; i < twopi; i += 0.01) {
    const r = fn(i);
    const x = r * cos(i);
    const y = r * sin(i);
    out.L(x, y);
  }
  return out;
};
const sys = space().margin(50, 50).dom(-5, 5).ran(-5, 5);
const p = plane([
  axis("x").stroke('teal'),
  axis("y").stroke('teal'),
  circle(100).stroke("teal").opacity(0.2),
  circle(150).stroke("teal").opacity(0.2),
  circle(200).stroke("teal").opacity(0.2),
  f(),
]).context(sys).figure();

export const PolarAxis = () => {
  return <Figure of={p} />;
};
