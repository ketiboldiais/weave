import { Angle, angle, AngleUnit } from "./angle.js";
import { safe, toDeg, toRadians, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { Circle, circle } from "./circle.js";
import { colorable } from "./colorable.js";
import { Line, line } from "./line.js";
import { FigNode } from "./node.types.js";
import { scopable } from "./scopable.js";
import { label, Text } from "./text.js";
import { typed } from "./typed.js";
import { Vector, vector } from "./vector.js";

const ARC = typed(colorable(scopable(Base)));

export class Arc extends ARC {
  startpoint: Vector;
  A: Vector;
  rotation: number;
  largeArcFlag: number;
  sweepFlag: number;
  /**
   * Sets the sweep flag of this
   * arc. This will “flip” the arc
   * along its axis.
   */
  sweep(value: number) {
    const c = this.copy();
    c.sweepFlag = value;
    return c;
  }
  endpoint: Vector;
  children: (Circle | Text | Line)[] = [];
  ctr:Vector = vector(0,0);
  copy() {
    const children = this.children;
    const a = new Arc(
      this.startpoint,
      this.A,
      this.rotation,
      this.largeArcFlag,
      this.sweepFlag,
      this.endpoint,
    ).copyColors(this);
    a.children = [...children];
    a.ctr = this.ctr;
    return a;
  }

  rotate(value: number, unit: "deg" | "rad") {
    const rotation = unit === "rad" ? toDeg(value) : value;
    const copy = this.copy();
    copy.rotation = rotation;
    return copy;
  }

  /**
   * Returns the change in rotation on this arc.
   */
  get dr() {
    const dx = this.dx;
    const dy = this.dy;
    return Math.sqrt((dx * dx) + (dy * dy));
  }

  /**
   * Returns the distance between
   * the starting x-coordinate of
   * this arc and the ending x-coordinate
   * of this arc.
   */
  get dx() {
    return this.endX - this.startX;
  }
  /**
   * Returns the distance between
   * the starting y-coordinate of
   * this arc and the ending y-coordinate
   * of this arc.
   */
  get dy() {
    return this.endY - this.startY;
  }

  /**
   * Sets the ending point for this arc.
   */
  end(point: Vector | [number, number]) {
    const c = this.copy();
    c.endpoint = Vector.from(point);
    return c;
  }

  /**
   * Sets the starting point for this arc.
   */
  start(point: Vector | [number, number]) {
    const c = this.copy();
    c.startpoint = Vector.from(point);
    return c;
  }

  /**
   * Returns the y-coordinate
   * of this arc’s starting point.
   */
  get startY() {
    return this.startpoint.y;
  }

  /**
   * Returns the x-coordinate of
   * this arc’s starting point.
   */
  get startX() {
    return this.startpoint.x;
  }

  /**
   * Returns the y-coordinate of
   * this arc’s endpoint.
   */
  get endY() {
    return this.endpoint.y;
  }

  /**
   * Returns the x-coordinate of
   * this arc’s endpoint.
   */
  get endX() {
    return this.endpoint.x;
  }

  /**
   * Includes a point to mark the start, end,
   * or center of this arc. Helpful for debugging
   * arcs.
   */
  mark(arcpoint: "start" | "end" | "secant" | 'center', markLabel?: string) {
    if (arcpoint === "start" || arcpoint === "end" || arcpoint==='center') {
      const point = arcpoint === "start"
        ? this.startpoint.copy()
        : arcpoint === 'center' ? this.ctr.copy() : this.endpoint.copy();
      const cx = point.x;
      const cy = point.y;
      const c = circle(0.02).PLACE(cx, cy);
      this.children.push(c);
      const t = label(markLabel ? markLabel : arcpoint).PLACE(
        cx + 0.01,
        cy - 0.1,
      );
      this.children.push(t);
    } else if (arcpoint === "secant") {
      this.children.push(this.secant());
    }
    return this;
  }
  secant() {
    const start = this.startpoint.copy();
    const end = this.endpoint.copy();
    const out = line(start, end);
    return out;
  }
  /**
   * Sets the radius of the arc’s underlying
   * circle.
   */
  r(x: number, y: number = x) {
    const c = this.copy();
    c.A.x = x;
    c.A.y = y;
    return c;
  }
  /**
   * Sets how tall the arc’s
   * underlying circle is.
   */
  ry(value: number) {
    const c = this.copy();
    c.A.y = value;
    return this;
  }
  /**
   * Sets how wide the arc’s
   * underlying circle is.
   */
  rx(value: number) {
    const c = this.copy();
    c.A.x = value;
    return this;
  }

  nice() {
    const copy = this.copy();
    return copy;
  }

  /**
   * Sets the center point of the arc.
   */
  center(value: Vector | [number, number]) {
    const v = Vector.from(value);
    const c = this.copy();
    c.A = v;
    return c;
  }
  constructor(
    M: Vector,
    A: Vector,
    rotation: number,
    largeArcFlag: number,
    sweepFlag: number,
    end: Vector,
  ) {
    super();
    this.type = "arc";
    this.startpoint = M;
    this.A = A;
    this.rotation = rotation;
    this.largeArcFlag = largeArcFlag;
    this.sweepFlag = sweepFlag;
    this.endpoint = end;
  }
  d() {
    const space = this.space();
    const x = space.scaleOf("x");
    const y = space.scaleOf("y");
    const x1 = x(this.startX);
    const y1 = y(this.startY);
    const x2 = x(this.endX);
    const y2 = y(this.endY);
    const rx = x(this.ctr.x);
    const ry = y(this.ctr.y);
    const rotation = this.rotation;
    const arc = this.largeArcFlag;
    const sweep = this.sweepFlag;
    const out =
      `M${x1},${y1} A${rx},${ry} ${rotation},${arc},${sweep} ${x2},${y2}`;
    return out;
  }
}

export const arc = (
  M?: Vector,
  center?: Vector | [number, number],
  rotation?: number,
  largeArcFlag?: number,
  sweepFlag?: 0 | 1,
  end?: Vector,
) => {
  const m = M ? M : vector(1, 0);
  const xr = rotation !== undefined ? rotation : 5;
  const laf = largeArcFlag !== undefined ? largeArcFlag : 0;
  const s = sweepFlag !== undefined ? sweepFlag : 0;
  const e = end ? end : vector(-1, 0);
  const a = center ? Vector.from(center) : vector(1, 1);
  return new Arc(m, a, xr, laf, s, e);
};

export const isArc = (node: FigNode): node is Arc => (
  !unsafe(node) && node.isType("arc")
);

export const carc = (
  delta: number,
  center: [number, number]=[0,0],
  t1: number=0,
  rx: number=1,
  ry: number=1,
  phi: number=0,
) => {
  const cos = Math.cos;
  const sin = Math.sin;
  const π = Math.PI;
  t1 = toRadians(0)

  // const f_matrix_times = ([[a, b], [c, d]], [x, y]) => [a * x + b * y, c * x + d * y];
  const f_matrix_times = (AB: [Vector, Vector], C: Vector) => {
    const [A, B] = AB;
    const a = A.x;
    const b = A.y;
    const c = B.x;
    const d = B.y;
    const x = C.x;
    const y = C.y;
    return vector(
      a * x + b * y,
      c * x + d * y,
    );
  };

  const f_rotate_matrix = (
    x: number,
  ): [Vector, Vector] => [
    Vector.from([cos(x), -sin(x)]),
    Vector.from([sin(x), cos(x)]),
  ];
  const f_vec_add = (A: Vector, B: Vector) =>
    Vector.from([A.x + B.x, A.y + B.y]);

  const [cx, cy] = center;
  delta = delta % (2 * π);
  const rotMatrix = f_rotate_matrix(phi);
  const S = f_vec_add(
    f_matrix_times(rotMatrix, Vector.from([rx * cos(t1), ry * sin(t1)])),
    Vector.from([cx, cy]),
  );
  const sX = S.x;
  const sY = S.y;
  const E = f_vec_add(
    f_matrix_times(
      rotMatrix,
      Vector.from([rx * cos(t1 + delta), ry * sin(t1 + delta)]),
    ),
    Vector.from([cx, cy]),
  );
  const eX = E.x;
  const eY = E.y;
  const fA = (delta > π) ? 0 : 0;
  const fS = (delta > 0) ? 0 : 0;
  const c = arc();
  c.startpoint = vector(sX, sY);
  c.endpoint = vector(eX, eY);
  c.rotation = phi / (2 * π) * 360;
  c.largeArcFlag = fA;
  c.sweepFlag = fS;
  return c;
};
