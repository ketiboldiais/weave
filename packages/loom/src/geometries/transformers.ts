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

class MatrixTransformer implements Transformer {
  path(path: Path): void {
    return;
  }
  line(line: Line): void {
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
