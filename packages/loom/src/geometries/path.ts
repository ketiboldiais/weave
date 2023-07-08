import { v3, Vector } from "@weave/math";
import { typed } from "../mixins/typed";
import { colorable } from "../mixins/colorable";
import { Base } from "../base";
import { scopable } from "../mixins/scopable";
import { FigNode } from "..";
import { unsafe } from "../aux";
import { parseDegrees } from "../parsers";
import {movable} from '../mixins/placeable';

type CommandPrefix = "M" | "L" | "H" | "V" | "Q" | "C" | "A" | "O";

const a3 = (ns: number[]) => (
  ns.length === 0
    ? v3(0, 0, 0)
    : ns.length === 2
    ? v3(ns[0], ns[1], 0)
    : v3(ns[0], ns[1], ns[2])
);

type ComType<T extends CommandPrefix> = {
  type: T;
  end: Vector;
};
type MCommand = ComType<"M">;

type LCommand = ComType<"L">;
type HCommand = ComType<"H">;
type VCommand = ComType<"V">;
type QCommand = ComType<"Q"> & { ctrl: Vector };
type CCommand = ComType<"C"> & { ctrl1: Vector; ctrl2: Vector };
type ACommand = ComType<"A"> & {
  rx: number;
  ry: number;
  rotation: number;
  largeArc: 0 | 1;
  sweep: 0 | 1;
};

type PathCommand =
  | MCommand
  | LCommand
  | HCommand
  | VCommand
  | QCommand
  | CCommand
  | ACommand;

// deno-fmt-ignore
const com1 = <T extends ("M" | "L" | "H" | "V")>(type: T) => (
  x: number,
  y: number,
  z: number = 0,
): ComType<T> => ({ end: v3(x, y, z), type });

export const M = com1("M");
export const L = com1("L");
export const H = com1("H");
export const V = com1("V");
export const Q = (controlPoint: number[], endPoint: number[]): QCommand => ({
  end: a3(endPoint),
  ctrl: a3(controlPoint),
  type: "Q",
});
export const C = (
  startControl: number[],
  endControl: number[],
  endPoint: number[],
): CCommand => ({
  end: a3(endPoint),
  ctrl1: a3(startControl),
  ctrl2: a3(endControl),
  type: "C",
});

export const A = (
  endPoint: number[],
  rx: number = 1,
  ry: number = 1,
  rotation: number = 0,
  largeArc: 0 | 1 = 0,
  sweep: 0 | 1 = 0,
): ACommand => ({
  rx,
  ry,
  end: a3(endPoint),
  rotation,
  largeArc,
  sweep,
  type: "A",
});

const p = (x: number) => Number.isInteger(x) ? `${x}` : x.toPrecision(3);

const scom = (c: PathCommand) => (c.type + (
  (c.type === "M" || c.type === "L" || c.type === "V" || c.type == "H")
    ? ``
    : (c.type === "Q")
    ? `${p(c.ctrl.x)},${p(c.ctrl.y)},`
    : (c.type === "C")
    ? `${p(c.ctrl1.x)},${p(c.ctrl1.y)},${p(c.ctrl2.x)},${p(c.ctrl2.y)},`
    : (c.type === "A")
    ? `${p(c.rx)},${p(c.ry)},${p(c.rotation)},${c.largeArc},${c.sweep},`
    : ``
) + `${p(c.end.x)},${p(c.end.y)}`);

const PathBase = typed(colorable(scopable(movable(Base))));

export class Path extends PathBase {
  commands: (PathCommand)[] = [];
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    super();
    this.commands = [M(x, y, z)];
    this.type = "path";
  }
  clear() {
    this.commands = [];
    return this;
  }
  concat(commands: PathCommand[]) {
    commands.forEach((c) => this.push(c));
    return this;
  }

  o(radius: number = 0.2) {
    const c1 = this.O;
    this.M(c1.x - (radius), c1.y);
    this.A([c1.x + radius, c1.y]);
    const c2 = this.O;
    this.A([c2.x - (radius * 2), c2.y]);
    this.M(c1.x, c1.y);
    return this;
  }

  /**
   * Given the current position `(a,b)`,
   * draws a vertical line to the
   * absolute position `(a,y)`.
   */
  V(y: number) {
    const current = this.O;
    // const newposition = v2(current.x, y);
    return this.push(V(current.x, y));
  }
  /**
   * Given the current position `(a,b)`,
   * draws a horizontal line to the
   * absolute position `(x,b)`.
   */
  H(x: number) {
    const current = this.O;
    return this.push(L(x, current.y));
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
    const [RX, RY] = Array.isArray(dimensions)
      ? dimensions
      : [dimensions, dimensions];
    const ROTATION = typeof rotation === "string"
      ? parseDegrees(rotation)
      : rotation;
    const ARC = arc === "major" ? 1 : 0;
    const SWEEP = sweep === "clockwise" ? 1 : 0;
    return this.push(A(end, RX, RY, ROTATION, ARC, SWEEP));
  }

  /**
   * Given the current starting position `(a,b)`,
   * draws a line to the position `(a, b + dy)`.
   */
  v(dy: number) {
    const x = this.O.x;
    const y = this.O.y + dy;
    return this.push(V(x, y));
  }

  /**
   * Given the current starting position `(a,b)`,
   * draws a line to the position `(a + dx, b)`.
   */
  h(dx: number) {
    const x = this.O.x + dx;
    const y = this.O.y;
    return this.push(H(x, y));
  }

  /**
   * Moves the cursor to the absolute
   * position `(x,y)`.
   */
  M(x: number, y: number) {
    return this.push(M(x, y));
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
    const current = this.O;
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
    const current = this.O;
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
   * Draws a line from the current cursor
   * position to the absolute position `(x,y)`.
   */
  L(x: number, y: number) {
    return this.push(L(x, y));
  }
  push(command: PathCommand) {
    this.commands.push(command);
    this.O = command.end;
    return this;
  }
  d() {
    const space = this.space();
    const x = space.scaleOf("x");
    const y = space.scaleOf("y");
    const out = this.commands.map((p) => {
      switch (p.type) {
        case "M":
          return M(x(p.end.x), y(p.end.y));
        case "H":
        case "L":
        case "V":
          return L(x(p.end.x), y(p.end.y));
        case "Q":
          return Q([x(p.ctrl.x), y(p.ctrl.y)], [x(p.end.x), y(p.end.y)]);
        case "C":
          return C(
            [x(p.ctrl1.x), y(p.ctrl1.y)],
            [x(p.ctrl2.x), y(p.ctrl2.y)],
            [x(p.end.x), y(p.end.y)],
          );
        case "A":
          return A(
            [x(p.end.x), y(p.end.y)],
            p.rx,
            p.ry,
            p.rotation,
            p.largeArc,
            p.sweep,
          );
      }
    }).map((v) => scom(v));
    return out.join("");
  }
}

export const path = (x: number = 0, y: number = 0, z: number = 0) => (
  new Path(x, y, z)
);
export const isPath = (node: FigNode): node is Path => (
  !unsafe(node) && node.isType("path")
);

export const trail = (
  points: [number, number][],
) => {
  const p = path(points[0][0], points[0][1]);
};
