import { isnum, isstr, unsafe } from "./aux.js";
import { colorable } from "./colorable";
import { FigNode } from "./node.types.js";
import { Space } from "./space.js";
import { label, TextNode } from "./text.js";
import { typed } from "./typed.js";
import {vector} from './vector.js';

export class Line {
  space: () => Space;
  text?: string | number | TextNode;
  label(text: TextNode | string | number) {
    this.text = text;
    return this;
  }
  /**
   * Returns a vector corresponding
   * to the midpoint of this line.
   */
  midpoint() {
    const x = this.y2 - this.y2 / 2;
    const y = this.x2 - this.x2 / 2;
    return vector(x,y);
  }
  /**
   * Returns the x-distance or y-distance
   * of this line.
   */
  d(of: "x" | "y") {
    return (of === "x" ? (this.x2 - this.x1) : this.y2 - this.y1);
  }
  scope(space: Space) {
    this.space = () => space;
    return this;
  }
  start(x: number, y: number) {
    this.x1 = x;
    this.y1 = y;
    return this;
  }
  end(x: number, y: number) {
    this.x2 = x;
    this.y2 = y;
    return this;
  }
  /**
   * The line’s starting x-coordiante.
   */
  x1: number;
  /**
   * The line’s starting y-coordinate.
   */
  y1: number;
  /**
   * The line’s ending x-coordinate.
   */
  x2: number;
  /**
   * The line’s ending y-coordinate.
   */
  y2: number;

  /**
   * The position of this line’s arrow,
   * if any.
   */
  arrowed?: "start" | "end" | "none" = 'none';
  constructor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.space = () => new Space();
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

/**
 * Returns a new {@link LineNode}.
 *
 * @param x1 - The starting x-coordinate of the line.
 * @param y1 - The starting y-coordinate of the line.
 * @param x2 - The ending x-coordinate of the line.
 * @param y2 - The ending y-coordinate of the line.
 *
 * All lines are {@link typed} `line` and {@link colorable}.
 */
const LINE = typed(colorable(Line));
export const line = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
) => {
  return new LINE(x1, y1, x2, y2).typed("line");
};
export type LineNode = ReturnType<typeof line>;
export const isLine = (node: FigNode): node is LineNode =>
  !unsafe(node) && node.isType("line");
