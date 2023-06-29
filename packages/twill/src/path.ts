import { cos, sin, toRadians, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable";
import { FigNode, Matrix, matrix, v2, Vector, vector } from "./index.js";
import { anglevalue } from "./parsers.js";
import { scopable } from "./scopable.js";
import { typed } from "./typed.js";

const PATH = typed(colorable(scopable(Base)));

type MCommand = { M: Vector };
type LCommand = { L: Vector };
type HCommand = { H: Vector };
type VCommand = { V: Vector };
type ZCommand = { Z: Vector };
/**
 * The first vector is the control point,
 * the second vector the end point.
 */
type QCommand = { Q: [Vector, Vector] };
/**
 * The first vector is the end point,
 * the second vector the start control point,
 * and the third vector is the end control point.
 */
type CCommand = { C: [Vector, Vector, Vector] };
type PathCommand =
  | MCommand
  | LCommand
  | HCommand
  | VCommand
  | ZCommand
  | QCommand
  | CCommand;

const iscom = <T extends PathCommand>(
  key: string,
) =>
(command: any): command is T => (
  command[key] !== undefined
);
const is_M = iscom<MCommand>("M");
const is_L = iscom<LCommand>("L");
const is_H = iscom<HCommand>("H");
const is_V = iscom<VCommand>("V");
const is_Z = iscom<ZCommand>("Z");
const is_Q = iscom<QCommand>("Q");
const is_C = iscom<CCommand>("C");

export class Path extends PATH {
  points: (PathCommand)[];
  cursor: Vector;
  constructor(M: Vector) {
    super();
    this.points = [{ M }];
    this.cursor = M;
    this.type = "path";
  }

  transform(callback: (vector: Vector) => Vector) {
    this.points = this.points.map((point) => {
      if (is_M(point)) {
        return { M: callback(point.M) };
      }
      if (is_L(point)) {
        return { L: callback(point.L) };
      }
      if (is_H(point)) {
        return { H: callback(point.H) };
      }
      if (is_V(point)) {
        return { V: callback(point.V) };
      }
      if (is_Z(point)) {
        return point;
      }
      if (is_Q(point)) {
        const [a, b] = point.Q;
        return { Q: [callback(a), callback(b)] };
      }
      if (is_C(point)) {
        const [a, b, c] = point.C;
        return { C: [callback(a), callback(b), callback(c)] };
      }
      return point;
    });
    this.updateCursor(callback(this.cursor));
    return this;
  }

  rotate(angle: string | number) {
    const theta = (typeof angle === "string")
      ? anglevalue.map((r) => r.unit === "deg" ? toRadians(r.value) : r.value)
        .parse(angle).result.unwrap(0)
      : angle;
    return this.transform((vector) =>
      vector.vxm(matrix([
        [cos(theta), sin(theta)],
        [-sin(theta), cos(theta)],
      ]))
    );
  }

  /**
   * Shears this path along the y-axis
   * by the given value.
   */
  shearY(value: number) {
    return this.transform((vector) =>
      vector.vxm(matrix([
        [1, 0],
        [value, 1],
      ]))
    );
  }

  /**
   * Shears this path along the x-axis
   * by the given value.
   */
  shearX(value: number) {
    return this.transform((vector) =>
      vector.vxm(matrix([
        [1, value],
        [0, 1],
      ]))
    );
  }

  /**
   * Reflects this path along its y-axis.
   */
  reflectY() {
    return this.transform((vector) =>
      vector.vxm(matrix([
        [-1, 0],
        [0, 1],
      ]))
    );
  }

  /**
   * Reflects this path along its x-axis.
   */
  reflectX() {
    return this.transform((vector) =>
      vector.vxm(matrix([
        [1, 0],
        [0, -1],
      ]))
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
    return this.transform((vector) =>
      vector.vxm(matrix([
        [x, 0],
        [0, y],
      ]))
    );
  }

  get start() {
    return (this.points[0] as MCommand);
  }

  d() {
    const coms: string[] = [];
    const P = this.points.length;
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    for (let i = 0; i < P; i++) {
      const point = this.points[i];
      if (is_M(point)) {
        const x = xs(point.M.x);
        const y = ys(point.M.y);
        coms.push(`M${x},${y}`);
        continue;
      }
      if (is_L(point)) {
        const x = xs(point.L.x);
        const y = ys(point.L.y);
        coms.push(`L${x},${y}`);
        continue;
      }
      if (is_H(point)) {
        const x = xs(point.H.x);
        coms.push(`H${x}`);
        continue;
      }
      if (is_V(point)) {
        const y = ys(point.V.y);
        coms.push(`V${y}`);
        continue;
      }
      if (is_Z(point)) {
        coms.push(`Z`);
        continue;
      }
      if (is_Q(point)) {
        const [control, end] = point.Q;
        const ctrl_x = xs(control.x);
        const ctrl_y = ys(control.y);
        const end_x = xs(end.x);
        const end_y = ys(end.y);
        coms.push(`Q${ctrl_x},${ctrl_y} ${end_x},${end_y}`);
        continue;
      }
      if (is_C(point)) {
        const [end, startCtrl, endCtrl] = point.C;
        const startCtrlX = xs(startCtrl.x);
        const startCtrlY = ys(startCtrl.y);
        const endCtrlX = xs(endCtrl.x);
        const endCtrlY = ys(endCtrl.y);
        const endX = xs(end.x);
        const endY = ys(end.y);
        coms.push(
          `C${startCtrlX},${startCtrlY} ${endCtrlX},${endCtrlY} ${endX},${endY}`,
        );
        continue;
      }
    }
    return coms.join(" ");
  }

  /**
   * @internal
   * Updates the current and last read
   * commands.
   */
  private updateCursor(vector: Vector) {
    this.cursor = vector;
  }

  /**
   * @internal
   * Appends commands that take one coordinate.
   */
  private push1Ary(
    command: "L" | "M" | "H" | "V" | "Z",
    coord: [number, number] | Vector,
  ) {
    const v = Vector.from(coord);
    this.points.push({ [`${command}`]: v } as PathCommand);
    this.updateCursor(v);
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
    const end = v2(current.x, current.y + height);
    const control = v2(current.x + width, current.y + height / 2);
    const Q: QCommand = { Q: [control, end] };
    this.updateCursor(end);
    this.points.push(Q);
    return this;
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
    const end = v2(current.x + width, current.y);
    const control = v2(current.x + width / 2, current.y + height);
    const Q: QCommand = { Q: [control, end] };
    this.updateCursor(end);
    this.points.push(Q);
    return this;
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
    endPoint: [number, number] | Vector,
    controlPoint: [number, number] | Vector,
  ) {
    const control = Vector.from(controlPoint);
    const end = Vector.from(endPoint);
    const Q: QCommand = { Q: [control, end] };
    this.updateCursor(end);
    this.points.push(Q);
    return this;
  }

  C(
    startControlPoint: [number, number] | Vector,
    endPoint: [number, number] | Vector,
    endControlPoint: [number, number] | Vector,
  ) {
    const end = Vector.from(endPoint);
    const startCtrl = Vector.from(startControlPoint);
    const endCtrl = Vector.from(endControlPoint);
    const C: CCommand = { C: [end, startCtrl, endCtrl] };
    this.updateCursor(end);
    this.points.push(C);
    return this;
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a vertical line to the position
   * `(a, b+y)`.
   */
  v(y: number) {
    const current = this.cursor;
    const newposition = v2(current.x, current.y + y);
    return this.push1Ary("L", newposition);
  }

  /**
   * Given the current position `(a,b)`,
   * draws a vertical line to the
   * absolute position `(a,y)`.
   */
  V(y: number) {
    const current = this.cursor;
    const newposition = v2(current.x, y);
    return this.push1Ary("L", newposition);
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a horizontal line to
   * the position `(a + x, b)`.
   */
  h(x: number) {
    const current = this.cursor;
    const newposition = v2(current.x + x, current.y);
    return this.push1Ary("L", newposition);
  }

  /**
   * Given the current position `(a,b)`,
   * draws a horizontal line to the
   * absolute position `(x,b)`.
   */
  H(x: number) {
    const current = this.cursor;
    return this.push1Ary("L", [x, current.y]);
  }

  Z() {
    return this.push1Ary("Z", this.start.M);
  }

  /**
   * Given the current cursor position
   * `(a,b)`, draws a line to the position
   * `(a + x, b + y)`.
   */
  l(x: number, y: number) {
    const current = this.cursor;
    const newPosition = current.add([x, y]);
    return this.push1Ary("L", newPosition);
  }
  /**
   * Draws a line from the current cursor
   * position to the absolute position `(x,y)`.
   */
  L(x: number, y: number) {
    return this.push1Ary("L", [x, y]);
  }
  /**
   * Moves the cursor to the absolute
   * position `(x,y)`.
   */
  M(x: number, y: number) {
    return this.push1Ary("M", [x, y]);
  }
  /**
   * Given the current cursor position
   * `(a,b)`, moves the cursor to the
   * position `(a + x, b + y)`.
   */
  m(x: number, y: number) {
    const current = this.cursor;
    const newPosition = current.add([x, y]);
    return this.push1Ary("M", newPosition);
  }
}

/**
 * Instantiates a new Path object.
 */
export const path = (origin?: number[] | Vector) => (
  new Path(Vector.from(origin ? origin : v2(0, 0)))
);

export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);
