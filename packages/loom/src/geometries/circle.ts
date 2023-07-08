import { unsafe } from "../aux.js";
import { colorable } from "../colorable.js";
import { FigNode } from "../index.js";
import { scopable } from "../scopable.js";
import { typed } from "../typed.js";
import { interpolator, Vector } from "@weave/math";

export const area = (radius: number) => (
  Math.PI * (radius ** 2)
);

const CIRCLE_BASE = scopable(typed(colorable(Vector)));

export class Circle extends CIRCLE_BASE {
  r: number = 5;
  dx: number = 0;
  dy: number = 0;

  constructor(radius: number) {
    super([0, 0, 0]);
    this.r = radius;
    this.type = "circle";
  }

  /**
   * Returns the scaled radius of this circle.
   */
  get sr() {
    const space = this.space();
    const max = (space.xmax() - space.xmin()) / 2;
    let rs = interpolator([0, max], [0, space.vw]);
    return rs(this.r);
  }
  radius(value: number) {
    this.r = value;
    return this;
  }
  /**
   * Returns the scaled x-coordinate
   * of this circle.
   */
  get sx() {
    const space = this.space();
    const xs = space.scaleOf("x");
    return xs(this.x);
  }
  /**
   * Returns the scaled y-coordinate
   * of this circle.
   */
  get sy() {
    const space = this.space();
    const ys = space.scaleOf("y");
    return ys(this.y);
  }
}

export const circle = (radius: number) => (
  new Circle(radius)
);
export const isCircle = (node: FigNode): node is Circle => (
  !unsafe(node) && node.isType("circle")
);
