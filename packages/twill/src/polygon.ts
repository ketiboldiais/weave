import { unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable.js";
import { FigNode } from "./node.types.js";
import {scopable} from './scopable.js';
import { Space } from "./space.js";
import { typed } from "./typed.js";
import { Vector, vector } from "./vector.js";

const polygonBase = typed(colorable(scopable(Base)));

export class Polygon extends polygonBase {
  points: Vector[];
  constructor() {
    super();
    this.points = [];
    this.type = "polygon";
    this.space = () => new Space();
  }
  point(x: number, y: number) {
    this.points.push(vector(x, y));
    return this;
  }
  path() {
    const out: string[] = [];
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    this.points.forEach((v) => {
      const x = xs(v.x);
      const y = ys(v.y);
      out.push(`${x},${y}`);
    });
    return out.join(" ");
  }
}

export const polygon = (
  ...points: ([number, number])[]
) => {
  const p = new Polygon();
  points.forEach(([x, y]) => p.point(x, y));
  return p;
};

export const isPolygon = (
  node: FigNode,
): node is Polygon => (
  !unsafe(node) && node.isType("polygon")
);
