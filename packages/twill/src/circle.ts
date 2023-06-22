import { unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable.js";
import { FigNode } from "./node.types.js";
import { scopable } from "./scopable.js";
import { linearScale, Space } from "./space.js";
import { typed } from "./typed.js";
import { Vector } from "./vector.js";

export const area = (radius: number) => (
  Math.PI * (radius ** 2)
);

const CIRCLE_BASE = scopable(typed(colorable(Vector)));

export class Circle extends CIRCLE_BASE {
  r: number = 5;
  dx: number = 0;
  dy: number = 0;

  /**
   * Returns the diameter of this circle,
   * per its current radius.
   */
  diameter() {
    return (2 * this.r);
  }

  /**
   * Returns the circumference of this
   * circle, per its current radius.
   */
  circumference() {
    return (2 * Math.PI * this.r);
  }

  /**
   * Returns the area of this circle,
   * per its current radius.
   */
  area() {
    return (Math.PI) * (this.r ** 2);
  }
  Dy(value: number) {
    this.dy = value;
    return this;
  }
  Dx(value: number) {
    this.dx = value;
    return this;
  }
  constructor(radius: number) {
    super([0, 0, 0]);
    this.space = () => new Space();
    this.r = radius;
    this.type = "circle";
  }
  get scaledRadius() {
    const space = this.space();
    const max = (space.xmax() - space.xmin()) / 2;
    let rs = linearScale([0, max], [0, space.boxed("width")/2]);
    return rs(this.r);
  }
  radius(value: number) {
    this.r = value;
    return this;
  }
  get pxy() {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    return `translate(${xs(this.x)},${ys(this.y)})`;
  }
}

export const circle = (radius: number) => (
  new Circle(radius)
);
export const isCircle = (node: FigNode): node is Circle => (
  !unsafe(node) && node.isType("circle")
);
