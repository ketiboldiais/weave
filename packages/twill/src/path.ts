import { cos, sin, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable";
import { FigNode, Matrix, matrix, v2, Vector } from "./index.js";
import { parseRadians } from "./parsers.js";
import {
  C,
  L,
  M,
  PathCommand,
  pathScaler,
  pathStringer,
  Q,
  transformer2D,
  V,
  Z,
} from "./pathcoms.js";
import { scopable } from "./scopable.js";
import { atyped } from "./typed.js";

const PATH = atyped(colorable(scopable(Base)));

export class Path extends PATH {
  points: (PathCommand)[];
  cursor: Vector;
  constructor(initX: number, initY: number) {
    super();
    this.points = [M(initX, initY)];
    this.cursor = v2(initX, initY);
    this.type = "path";
  }

  transform(matrix: Matrix) {
    const t = transformer2D(matrix);
    this.points = this.points.map((p) => t(p));
    this.cursor = this.cursor.vxm(matrix);
    return this;
  }

  rotate(angle: string | number) {
    const theta = typeof angle === "string" ? parseRadians(angle) : angle;
    return this.transform(matrix([
      [cos(theta), sin(theta)],
      [-sin(theta), cos(theta)],
    ]));
  }

  /**
   * Shears this path along the y-axis
   * by the given value.
   */
  shearY(value: number) {
    return this.transform(
      matrix([
        [1, 0],
        [value, 1],
      ]),
    );
  }

  /**
   * Shears this path along the x-axis
   * by the given value.
   */
  shearX(value: number) {
    return this.transform(matrix([
      [1, value],
      [0, 1],
    ]));
  }

  /**
   * Reflects this path along its y-axis.
   */
  reflectY() {
    return this.transform(
      matrix([
        [-1, 0],
        [0, 1],
      ]),
    );
  }

  /**
   * Reflects this path along its x-axis.
   */
  reflectX() {
    return this.transform(
      matrix([
        [1, 0],
        [0, -1],
      ]),
    );
  }

  /**
   * Scales this path by the given value.
   * If a single value is passed or both
   * `x` and `y` are equal, scales
   * uniformly. Otherwise, `x` will
   * scale the path along the x-axis,
   * and `y` along the y-axis.
   *
   * @param x - The x-scale factor.
   * @param y - The y-scale factor.
   */
  scale(x: number, y: number = x) {
    return this.transform(
      matrix([
        [x, 0],
        [0, y],
      ]),
    );
  }

  d() {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const scaler = pathScaler(xs, ys);
    return this.points.map((p) => pathStringer(scaler(p))).join(" ");
  }

  push(command: PathCommand) {
    this.points.push(command);
    this.cursor = Vector.from(command.end);
    return this;
  }
  /**
   * Given the current position `(a,b)`,
   * draws a quadratic Bezier curve
   * with the end point `(a, b + height)`,
   * and the control point `(m + height, b)`,
   * where `m` is the midpoint of `(a,b)`
   * and `(a, b + height)`.
   */
  By(
    height: number,
    width: number,
  ) {
    const current = this.cursor;
    const end = [current.x, current.y + height];
    const control = [current.x + width, current.y + height / 2];
    return this.push(Q(control, end));
  }
  /**
   * Given the current position `(a,b)`,
   * draws a quadratic Bezier curve
   * with the end point `(a + width, b)`,
   * and the control point `(a, m + height)`,
   * where `m` is the midpoint of `(a,b)`
   * and `(a + width, b)`.
   */
  Bx(
    width: number,
    height: number,
  ) {
    const current = this.cursor;
    const end = [current.x + width, current.y];
    const control = [current.x + (width / 2), current.y + height];
    return this.push(Q(control, end));
  }

  /**
   * Given the current position `(a,b)`, draws
   * a quadraic Bezier curve with the given `endPoint`,
   * and `controlPoint`. Post-drawing, the `endPoint`
   * becomes the current position.
   *
   * @param endPoint - The curve’s end point.
   * @param controlPoint - The curve’s curvature
   * control.
   */
  Q(
    endPoint: [number, number],
    controlPoint: [number, number],
  ) {
    this.push(Q(controlPoint, endPoint));
    return this;
  }

  C(
    startControlPoint: [number, number],
    endPoint: [number, number],
    endControlPoint: [number, number],
  ) {
    this.push(C(startControlPoint, endControlPoint, endPoint));
    return this;
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a vertical line to the position
   * `(a, b+y)`.
   */
  v(y: number) {
    const current = this.cursor;
    return this.push(L(current.x, current.y + y));
  }

  /**
   * Given the current position `(a,b)`,
   * draws a vertical line to the
   * absolute position `(a,y)`.
   */
  V(y: number) {
    const current = this.cursor;
    // const newposition = v2(current.x, y);
    return this.push(V(current.x, y));
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a horizontal line to
   * the position `(a + x, b)`.
   */
  h(x: number) {
    const current = this.cursor;
    return this.push(L(current.x + x, current.y));
  }

  /**
   * Given the current position `(a,b)`,
   * draws a horizontal line to the
   * absolute position `(x,b)`.
   */
  H(x: number) {
    const current = this.cursor;
    return this.push(L(x, current.y));
  }

  Z() {
    return this.push(Z(this.cursor.x, this.cursor.y));
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a line to the position
   * `(a + x, b + y)`.
   */
  l(x: number, y: number) {
    const current = this.cursor;
    return this.push(L(current.x + x, current.y + y));
  }
  /**
   * Draws a line from the current cursor
   * position to the absolute position `(x,y)`.
   */
  L(x: number, y: number) {
    return this.push(L(x, y));
    // return this.push1Ary("L", [x, y]);
  }
  /**
   * Moves the cursor to the absolute
   * position `(x,y)`.
   */
  M(x: number, y: number) {
    return this.push(M(x, y));
    // return this.push1Ary("M", [x, y]);
  }
  /**
   * Given the current cursor position
   * `(a,b)`, moves the cursor to the
   * position `(a + x, b + y)`.
   */
  m(x: number, y: number) {
    const current = this.cursor;
    return this.push(M(current.x + x, current.y + y));
  }
}

/**
 * Instantiates a new Path object.
 */
export const path = (startX: number = 0, startY: number = 0) => (
  new Path(startX, startY)
);

export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);
