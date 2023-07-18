import { axis, path, plane, space } from "@weave/loom";
import { Figure } from "../components/figure";
import { matrix, sqrt, v3 } from "@weave/math";

const cube = () => {
  const out = path();
  const cs = [
    v3(-1, -1, -1),
    v3(1, -1, -1),
    v3(1, 1, -1),
    v3(-1, 1, -1),
    v3(-1, -1, 1),
    v3(1, -1, 1),
    v3(1, 1, 1),
    v3(-1, 1, 1),
  ];
  for (let i = 0; i < 4; i++) {
    const A = cs[i];
    out.M(A.x, A.y, A.z);
    const B = cs[(i + 1) % 4];
    out.L(B.x, B.y, B.z);
    const C = cs[i + 4];
    out.M(C.x, C.y, C.z);
    const D = cs[((i + 1) % 4) + 4];
    out.L(D.x, D.y, D.z);
    const E = cs[i];
    out.M(E.x, E.y, E.z);
    const F = cs[i + 4];
    out.L(F.x, F.y, F.z);
  }
  return out;
};



const path1 = plane([
  axis("x"),
  axis("y"),
  cube().rotateX("45deg").rotateY("20deg").rotateZ("5deg"),
]).context(space(300,300).dom(-5,5).ran(-5,5).margin(5,5)).figure();

export const Path1 = () => {
  return <Figure of={path1} />;
};

