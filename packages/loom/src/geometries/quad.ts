import { v3, Vector, vector } from "@weave/math";
import { colorable } from "../mixins/colorable";
import { scopable } from "../mixins/scopable";
import { typed } from "../mixins/typed";
import { Base } from "../base";
import { FigNode } from "..";
import { unsafe } from "../aux";
import { movable } from "../mixins/placeable";

const QuadBase = typed(colorable(scopable(movable(Base))));

export class Quad extends QuadBase {
  /** The quadrilateral’s width. */
  W: number;
  /** The quadrilateral’s height. */
  H: number;
  /** The horizontal corner radius. */
  Rx: number = 0;
  /** The vertical corner radius. */
  Ry: number = 0;
  origin: Vector;
  constructor(width: number, height: number) {
    super();
    this.W = width;
    this.H = height;
    this.type = "quad";
    this.origin = v3(0, 0, 0);
  }
  height(value: number) {
    this.H = value;
    return this;
  }
  width(value: number) {
    this.W = value;
    return this;
  }
  /**
   * Sets the vertical corner radius.
   */
  ry(value: number) {
    this.Ry = value;
    return this;
  }
  /**
   * Sets the horizontal corner radius.
   */
  rx(value: number) {
    this.Rx = value;
    return this;
  }
}

export const quad = (width: number, height: number) => (
  new Quad(width, height)
);

export const isQuad = (node: FigNode): node is Quad => (
  !unsafe(node) && node.isType("quad")
);
