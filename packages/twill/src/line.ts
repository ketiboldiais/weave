import { safer, toRadians, unsafe } from "./aux.js";
import { Base } from "./base.js";
import { colorable } from "./colorable";
import { FigNode } from "./node.types.js";
import { scopable } from "./scopable.js";
import { TextNode } from "./text.js";
import { typed } from "./typed.js";
import { Vector, vector } from "./vector.js";

const LINE = typed(colorable(scopable(Base)));

export class Line extends LINE {
  text?: string | number | TextNode;
  label(text: TextNode | string | number) {
    this.text = text;
    return this;
  }
  clone() {
    const start = this.start;
    const end = this.end;
    const copy = new Line(start,end);
    copy.arrowed = this.arrowed;
    copy.copyColors(this);
    return copy;
  }
  rotate(value: number, unit: "deg" | "rad") {
    const l = this.clone();
    const mag = l.end.mag();
    // deno-fmt-ignore
    const val = (unit === "deg") 
      ? (toRadians(value)) 
      : value;
    const dx = Math.cos(val);
    const dy = Math.sin(val);
    const nx = mag * dx;
    const ny = mag * dy;
    l.end = vector(nx, ny);
    return l;
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
  /**
   * Returns a vector corresponding
   * to the midpoint of this line.
   */
  midpoint() {
    const x = this.y2 - this.y2 / 2;
    const y = this.x2 - this.x2 / 2;
    return vector(x, y);
  }
  /**
   * Returns the x-distance or y-distance
   * of this line.
   */
  d(of: "x" | "y") {
    return (of === "x" ? (this.x2 - this.x1) : this.y2 - this.y1);
  }
  start: Vector;
  end: Vector;
  /**
   * The position of this line’s arrow,
   * if any.
   */
  arrowed: "start" | "end" | "none" = "none";
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

export const ray = (start: Vector | number[], end: Vector | number[]) =>
  line(start, end).arrow("end");
