import { v3, Vector, vector } from "@weave/math";
import { colorable } from "../colorable";
import { scopable } from "../scopable";
import { typed } from "../typed";
import { Base } from "../base";
import { FigNode } from "..";
import { unsafe } from "../aux";

const RectBase = typed(colorable(scopable(Base)));

export class Quad extends RectBase {
  w: number;
  h: number;
  /** The horizontal corner radius. */
  Rx: number = 0;
  /** The vertical corner radius. */
  Ry: number = 0;
  origin: Vector;
  constructor(width: number, height: number) {
    super();
    this.w = width;
    this.h = height;
    this.type = "quad";
    this.origin = v3(0, 0, 0);
  }
  at(x: number, y: number, z: number = 0) {
    this.origin = v3(x, y, z);
  }
}

export const quad = (width: number, height: number) => (
  new Quad(width, height)
);

export const isQuad = (node: FigNode): node is Quad => (
  !unsafe(node) && node.isType("quad")
);
