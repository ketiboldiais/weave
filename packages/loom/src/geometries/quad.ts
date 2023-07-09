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
  constructor(width: number, height: number) {
    super();
    this.W = width;
    this.H = height;
    this.type = "quad";
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
  get ne() {
    return v3(this.x, this.y, this.z);
  }
  get nw() {
    return v3(this.x, this.H - (this.H / 2), this.z);
  }
  get se() {
    return v3(this.W + (this.W / 2), this.y, this.z);
  }
  get sw() {
    return v3(this.W + (this.W / 2), this.H - (this.H / 2), this.z);
  }
}

export const quad = (width: number, height: number) => (
  new Quad(width, height)
);

export const isQuad = (node: FigNode): node is Quad => (
  !unsafe(node) && node.isType("quad")
);
