import { shift, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable.js";
import {
  arrowDef,
  circle,
  isLine,
  line,
  Space,
  Vector,
} from "./index.js";
import { FigNode, Node3D } from "./index.js";
import { scopable } from "./scopable.js";
import { typed } from "./typed.js";

const SPACE3D = typed(Space);

export class Space3D extends SPACE3D {
  children: Node3D[];
  constructor(children: Node3D[]) {
    super();
    this.type = "space-3D";
    this.children = children;
  }
  figure() {
    this.children.forEach((child) => {
      child.scope(this);
      if (isLine(child) && child.isArrowed()) this.defineArrow(child);
      if (isAxis3D(child)) {
        const arrow = arrowDef().uid(child.id);
        if (child.direction === "y") arrow.rotation("180");
        this.define(arrow);
      }
    });
    return this;
  }
}
const AXIS3D = typed(colorable(scopable(Base)));
export class Axis3D extends AXIS3D {
  direction: "x" | "y" | "z";
  constructor(direction: "x" | "y" | "z") {
    super();
    this.direction = direction;
    this.type = "axis-3D";
  }
  translate() {
    const space = this.space();
    const xscale = space.scaleOf("x");
    const yscale = space.scaleOf("y");
    if (this.direction === "z") {
      const ys = space.image("y");
      const xs = space.image("x");
      const xLength = xs.y - xs.x;
      const yLength = ys.y - ys.x;
      return shift(xscale(-xLength / 2), yscale(-yLength / 2));
    } else if (this.direction === "y") {
      return shift(xscale(0), 0);
    } else return shift(0, yscale(0));
  }
  rotation() {
    if (this.direction === "x") {
      return `rotate(0)`;
    }
    if (this.direction === "y") {
      return `rotate(90)`;
    }
    return `rotate(-45)`;
  }
  path() {
    const space = this.space();
    const image = space.image(this.direction);
    const scale = space.scaleOf(this.direction);
    const x = scale(image.x);
    const y = scale(image.y);
    const l = 0;
    return `M${x} ${l} v ${-l} H ${y} v ${0}`;
  }
}

export const isAxis3D = (node: FigNode): node is Axis3D => (
  !unsafe(node) && node.isType("axis-3D")
);

export const axis3 = (direction: "x" | "y" | "z") => (
  new Axis3D(direction)
);

const POINT3D = typed(scopable(Base));
export class Point3D extends POINT3D {
  p: Vector;
  constructor(position: Vector) {
    super();
    this.p = position;
    this.type = "point-3D";
  }
  circle(radius: number = 1) {
    const sp = this.space();
    const x = sp.scaleOf("x");
    const y = sp.scaleOf("y");
    return circle(radius).xy(x(this.p.x), y(this.p.y));
  }
}

export const p3 = (position: number[] | Vector) => (
  new Point3D(Vector.from(position))
);
export const isPoint3D = (node: FigNode): node is Point3D => (
  !unsafe(node) && node.isType("point-3D")
);

export const space3 = (children: (Node3D | Node3D[])[]) => {
  return new Space3D(children.flat());
};
export const isSpace3 = (node: FigNode): node is Space3D => (
  !unsafe(node) && node.isType("space-3D")
);

const RAY = typed(scopable(Base));

export class Ray extends RAY {
  /** The origin of this 3D ray. */
  o: Vector;
  /** The direction of this 3D ray. */
  d: Vector;
  constructor(direction: Vector, origin: Vector) {
    super();
    this.o = origin;
    this.d = direction;
    this.type = "ray-3D";
  }
  fig() {
    return line(this.o, this.d).arrow('end');
  }
  /**
   * Sets the direction of this vector.
   */
  to(vector:Vector|number[]) {
    this.d=Vector.from(vector);
    return this;
  }
  /**
   * Sets the origin of this vector.
   */
  from(vector:Vector|number[]) {
    this.o=Vector.from(vector);
    return this;
  }
  p(t: number) {
    const o = this.o;
    const d = this.d;
    const out = o.add(d.mul(t));
    return out;
  }
}

export const ray = (
  direction: Vector | number[],
  origin: Vector | number[] = [0, 0, 0],
) => {
  return new Ray(Vector.from(direction), Vector.from(origin));
};

export const isRay = (node:FigNode): node is Ray => (
  !unsafe(node) && node.isType('ray-3D')
)
