import { unsafe } from "../aux.js";
import { colorable } from "../mixins/colorable.js";
import { FigNode } from "../index.js";
import { scopable } from "../mixins/scopable.js";
import { typed } from "../mixins/typed.js";
import { interpolator } from "@weave/math";
import { Base } from "../base.js";
import { movable } from "../mixins/placeable.js";

const CIRCLE_BASE = scopable(typed(colorable(movable(Base))));

export class Circle extends CIRCLE_BASE {
  r: number = 5;
  dx: number = 0;
  dy: number = 0;
  constructor(radius: number) {
    super();
    this.r = radius;
    this.type = "circle";
  }
}

export const circle = (radius: number) => (
  new Circle(radius)
);
export const isCircle = (node: FigNode): node is Circle => (
  !unsafe(node) && node.isType("circle")
);
