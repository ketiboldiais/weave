import { Matrix, v3 } from "@weave/math";
import { Circle, Quad } from "..";
import { Line } from "./line.js";
import { Path } from "./path.js";

interface Transformer {
  path(path: Path): void;
  line(line: Line): void;
  quad(quad: Quad): void;
  circle(circle: Circle): void;
}

class Translator implements Transformer {
  path(path: Path): void {
    return;
  }
  line(line: Line): void {
    const v1 = v3(line.x1, line.y1, line.O.z).vxm(this.matrix);
    const v2 = v3(line.x2, line.y2, line.O.z).vxm(this.matrix);
    return;
  }
  quad(quad: Quad): void {
    return;
  }
  circle(circle: Circle): void {
    return;
  }
  matrix: Matrix;
  constructor(matrix: Matrix) {
    this.matrix = matrix;
  }
}
