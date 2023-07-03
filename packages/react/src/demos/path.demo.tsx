import { color, rect } from "@weave/loom";
import { Figure } from "../components/figure";
import { plane } from "@weave/loom";

const coral = color('coral');
const path1 = plane([
  rect(2, 4).fill(coral),
  rect(2, 4).fill(coral.compliment()).opacity(0.5).rotate("45deg"),
  rect(2, 4).fill(color("yellowgreen")).opacity(0.5).shearX(2),
]).margin(10, 10).w(300).h(300).gridlines("xy").figure();

export const Path1 = () => {
  return <Figure of={path1} />;
};
