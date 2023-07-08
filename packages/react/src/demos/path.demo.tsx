import { color, plane, path, axis, line, M, L } from "@weave/loom";
import { Figure } from "../components/figure";

const coral = color("coral");
const path1 = plane([
  axis('y'),
  axis('x'),
]).margin(10, 10).w(300).h(300).gridlines("xy").figure();

export const Path1 = () => {
  return <Figure of={path1} />;
};
