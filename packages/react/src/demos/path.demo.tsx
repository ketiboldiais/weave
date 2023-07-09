import {
  axis,
  color,
  path,
  plane,
} from "@weave/loom";
import {v3} from '@weave/math';
import { Figure } from "../components/figure";

const coral = color("coral");
const v1 = v3(0,0,0);
const v2 = v3(2,2,1);

const path1 = plane([
  axis("y"),
  axis("x"),
  path().L(0,1).L(2,1).L(2,0).Z().fill('thistle'),
]).x(-5, 5).y(-5, 5).margin(10, 10).size(300, 300).gridlines("xy").figure();

export const Path1 = () => {
  return <Figure of={path1} />;
};
