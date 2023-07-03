import { safer, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable";
import { FigNode } from "./index.js";
import { scopable } from "./scopable.js";
import { tagged, typed } from "./typed.js";
import { v2, Vector, vector } from "@weave/math";

const LINE = typed(colorable(scopable(tagged(Base))));

export class Line extends LINE {
  copy() {
    const start = this.start;
    const end = this.end;
    const copy = new Line(v2(start.x, start.y), v2(end.x, end.y));
    copy.arrowed = this.arrowed;
    copy.copyColors(this);
    return copy;
  }
  get x1() {
    return this.start.x;
  }
  set x1(value: number) {
    this.start.x = value;
  }
  get y1() {
    return this.start.y;
  }
  set y1(value: number) {
    this.start.y = value;
  }
  get x2() {
    return this.end.x;
  }
  set x2(value: number) {
    this.end.x = value;
  }
  get y2() {
    return this.end.y;
  }
  set y2(value: number) {
    this.end.y = value;
  }
  start: Vector;
  end: Vector;
  /**
   * The position of this line’s arrow,
   * if any.
   */
  arrowed?: "start" | "end";
  constructor(start: Vector, end: Vector) {
    super();
    this.start = start;
    this.end = end;
    this.type = "line";
  }
  /**
   * Defines the line object as having
   * an arrow. If set, the line’s
   * space will include arrow definitions.
   */
  arrow(on: "start" | "end") {
    this.arrowed = on;
    return this;
  }
}
export const line = (start: Vector | number[], end: Vector | number[]) => {
  const START: Vector = Array.isArray(start)
    ? vector(safer(start[0], 0), safer(start[1], 0))
    : start;
  const END: Vector = Array.isArray(end)
    ? vector(safer(end[0], 0), safer(end[1], 0))
    : end;
  return new Line(START, END);
};
export const isLine = (node: FigNode): node is Line => (
  !unsafe(node) && node.isType("line")
);

export const arrow = (
  start: Vector | number[],
  end: Vector | number[],
) => line(start, end).arrow("end");
