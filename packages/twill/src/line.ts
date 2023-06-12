import {unsafe} from "./aux.js";
import { colorable } from "./colorable";
import {FigNode} from "./node.types.js";
import { typed } from "./typed.js";

class Line {
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
  arrowed?: "start" | "end" | "none";
  constructor(x1: number, y1: number, x2: number, y2: number) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
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
export const line = (x1: number, y1: number, x2: number, y2: number) => {
  const fig = typed(colorable(Line));
  return new fig(x1, y1, x2, y2).typed("line");
};
export type LineNode = ReturnType<typeof line>;
export const isLine = (node:FigNode): node is LineNode => (
  !unsafe(node) && node.isType('line')
)