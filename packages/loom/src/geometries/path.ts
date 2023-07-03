import { cos, sin, unsafe } from "../aux.js";
import { Base } from "../base.js";
import { colorable } from "../colorable.js";
import { Matrix, matrix, v2, Vector } from "@weave/math";
import { FigNode, linear } from "../index.js";
import { parseDegrees, parseRadians } from "../parsers.js";
import {
  A,
  C,
  H,
  L,
  M,
  P,
  PathCommand,
  pathScaler,
  pathStringer,
  Q,
  S,
  T,
  transformer2D,
  V,
  Z,
} from "./pathcoms.js";
import { scopable } from "../scopable.js";
import { typed } from "../typed.js";

const PATH = typed(colorable(scopable(Base)));

export class Path extends PATH {
  points: (PathCommand)[];
  cursor: Vector;
  get end() {
    if (this.points.length) {
      return Vector.from(this.points[this.points.length - 1].end);
    }
    return Vector.from([0, 0]);
  }
  get start() {
    if (this.points.length) return Vector.from(this.points[0].end);
    return Vector.from([0, 0]);
  }
  constructor(initX?: number, initY?: number) {
    super();
    const defined = initX !== undefined && initY !== undefined;
    this.points = defined ? [M(initX, initY)] : [];
    this.cursor = defined ? v2(initX, initY) : v2(0, 0);
    this.type = "path";
  }
  concat(pathCommands: (PathCommand | Path)[]) {
    if (pathCommands.length === 0) return this;
    const pcs = pathCommands
      .map((p) => p instanceof Path ? p.points : p)
      .flat();
    pcs.forEach((p) => this.points.push(p));
    this.cursor = Vector.from(pcs[pcs.length - 1].end);
    return this;
  }
  /**
   * Clears all points on this path currently.
   */
  clear() {
    this.points = [];
    this.cursor = v2(0, 0);
    return this;
  }

  private tfm(matrix: Matrix) {
    const t = transformer2D(matrix);
    this.points = this.points.map((p) => t(p));
    this.cursor = this.cursor.vxm(matrix);
    return this;
  }

  /**
   * Rotates this path by the given angle.
   * If a number is passed for the angle
   * value, the angle unit is assumed to be
   * radians. If a string is passed, Weave’s
   * combinators will attempt to parse an angle,
   * defaulting to 0 in failure.
   */
  rotate(angle: string | number) {
    const theta = typeof angle === "string" ? parseRadians(angle) : angle;
    return this.tfm(matrix([
      [cos(theta), sin(theta)],
      [-sin(theta), cos(theta)],
    ]));
  }

  /**
   * Shears this path along the y-axis
   * by the given value.
   */
  shearY(value: number) {
    return this.tfm(
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
    return this.tfm(matrix([
      [1, value],
      [0, 1],
    ]));
  }

  /**
   * Reflects this path along its y-axis.
   */
  reflectY() {
    return this.tfm(
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
    return this.tfm(
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
    return this.tfm(
      matrix([
        [x, 0],
        [0, y],
      ]),
    );
  }

  /**
   * Returns this path’s string.
   */
  d() {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const scaler = pathScaler(xs, ys);
    const xmax = (space.xmax() - space.xmin()) / 2;
    const ymax = (space.ymax() - space.ymin()) / 2;
    const rxs = linear([0, xmax], [0, space.vw / 2]);
    const rys = linear([0, ymax], [0, space.vh / 2]);
    return this.points.map((p) =>
      pathStringer(
        p.type === "P"
          ? P([xs(p.end[0]), ys(p.end[1])], [
            rxs((p as any).rxry[0]),
            rys((p as any).rxry[1]),
          ])
          : scaler(p),
      )
    ).join(" ");
  }
  private push(command: PathCommand) {
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
  /**
   * Appends a cubic Bezier curve command.
   */
  C(
    startControlPoint: [number, number],
    endPoint: [number, number],
    endControlPoint: [number, number],
  ) {
    this.push(C(startControlPoint, endControlPoint, endPoint));
    return this;
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
   * Given the current position `(a,b)`,
   * draws a horizontal line to the
   * absolute position `(x,b)`.
   */
  H(x: number) {
    const current = this.cursor;
    return this.push(L(x, current.y));
  }

  /**
   * Appends an S command.
   */
  S() {
    return this.push(S(this.cursor.x, this.cursor.y));
  }

  /**
   * Appends a T command.
   */
  T() {
    return this.push(T(this.cursor.x, this.cursor.y));
  }

  /**
   * Closes this path.
   */
  Z() {
    return this.push(Z(this.cursor.x, this.cursor.y));
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
   * @param end - The arc’s end point.
   * @param dimensions - Either a pair `(w,h)` where `w` is the width of
   * the arc, and `h` is the height of the arc, or a number.
   * If a number is passed, draws an arc where `w = h` (a circular
   * arc). Defaults to `[1,1]`.
   * @param rotation - The arc’s rotation along its x-axis. If
   * a string is passed, Weave’s parsers will attempt to parse
   * an angle, defaulting to 0 in failure. If a number is
   * passed, assumes the angle unit is in radians. Defaults to `0`.
   * @param arc - Either `minor` (the smaller half of the arc,
   * corresponding to a large arc flag of `0`) or `major` (the
   * larger half of the arc, corresponding to a large arc
   * flag of `1`). Defaults to `minor`.
   * @param sweep - Either `clockwise` (thus drawing the arc
   * clockwise, a sweep flag of 1) or `counter-clockwise` (
   * thus drawing the arc counter-clockwise, a sweep flag of
   * 0). Defaults to `clockwise`.
   */
  A(
    end: number[],
    dimensions: number[] | number = [1, 1],
    arc: "minor" | "major" = "minor",
    rotation: number | string = 0,
    sweep: "clockwise" | "counter-clockwise" = "clockwise",
  ) {
    return this.push(A(
      Array.isArray(dimensions) ? dimensions : [dimensions, dimensions],
      typeof rotation === "string" ? parseDegrees(rotation) : rotation,
      arc === "major" ? 1 : 0,
      sweep === "clockwise" ? 1 : 0,
      end,
    ));
  }

  /**
   * Draws an ellipse.
   * @param radiusX - The width of the ellipse.
   * @param radiusY - The height of the ellipse.
   * @param center - Optionally set the center point of the ellipse.
   * If the center isn’t provided, defaults to the current cursor position.
   */
  E(radiusX: number, radiusY: number, center?: number[]) {
    const c = center !== undefined ? center : [this.cursor.x, this.cursor.y];
    return this.push(P(c, [radiusX, radiusY]));
  }

  /**
   * Draws a circle.
   * @param radius - The circle’s radius.
   * @param center - Optionally set the center point of the circle.
   * If the center isn’t provided, defaults to the current cursor
   * position.
   */
  O(radius: number, center?: number[]) {
    const c = center !== undefined ? center : [this.cursor.x, this.cursor.y];
    return this.push(P(c, [radius, radius]));
  }

  // Relative Commands
  /**
   * Given the current starting position `(a,b)`,
   * draws a line to the position `(a + dx, b)`.
   */
  h(dx: number) {
    const x = this.cursor.x + dx;
    const y = this.cursor.y;
    return this.push(H(x, y));
  }
  /**
   * Given the current starting position `(a,b)`,
   * draws a line to the position `(a, b + dy)`.
   */
  v(dy: number) {
    const x = this.cursor.x;
    const y = this.cursor.y + dy;
    return this.push(V(x, y));
  }
}

/**
 * Instantiates a new Path object.
 * @param startX - An optional starting x-coordinate. Defaults to 0.
 * @param startY - An optional starting y-coordinate. Defaults to 0.
 */
export const path = (startX: number = 0, startY: number = 0) => (
  new Path(startX, startY)
);

/**
 * Bundles the provided paths into a single path.
 */
export const group = (paths: (PathCommand | Path)[]) => (
  new Path().clear().concat(paths)
);

export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);

export const circ = (radius: number, center: number[] = [0, 0]) => (
  path(center[0], center[1]).O(radius)
);
export const rect = (
  width: number,
  height: number,
  center: number[] = [0, 0],
) => (
  path(center[0] - (width / 2), center[1] - (height / 2))
    .h(width)
    .v(height)
    .h(-width)
    .v(-height)
);
