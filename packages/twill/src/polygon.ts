import { unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable.js";
import { FigNode } from "./node.types.js";
import { scopable } from "./scopable.js";
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
  point(coord: Vector | number[]) {
    this.points.push(Vector.from(coord));
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
  ...points: (Vector | number[])[]
) => {
  const p = new Polygon();
  points.forEach((point) => p.point(point));
  return p;
};

export const isPolygon = (
  node: FigNode,
): node is Polygon => (
  !unsafe(node) && node.isType("polygon")
);

// polygon([-1, 0.5], [1, 0.5], [1, -0.5], [-1, -0.5]),
export const rect = (
  length: number,
  height: number,
  center: [number, number] = [0, 0],
) => {
  const [cx, cy] = center;
  const halfLength = length / 2;
  const halfHeight = height / 2;
  const leftX = cx - halfLength;
  const rightX = cx + halfLength;
  const topY = cy + halfHeight;
  const botY = cy - halfHeight;
  const p1 = [leftX, topY];
  const p2 = [rightX, topY];
  const p3 = [rightX, botY];
  const p4 = [leftX, botY];
  return polygon(p1, p2, p3, p4);
};
