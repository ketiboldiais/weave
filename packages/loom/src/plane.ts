import {
  CoordSpace,
  definable,
  isCircle,
  isGroup,
  isQuad,
  space,
} from "./index.js";
import { typed } from "./mixins/typed.js";
import { FigNode, Node2D } from "./index.js";
import { isLine } from "./geometries/line.js";
import { unsafe } from "./aux.js";
import { cos, interpolator, sin } from "@weave/math";
import { Base } from "./base.js";

const PLANE = typed(definable(Base));

export class Plane extends PLANE {
  nodes: Node2D[];
  constructor(nodes: Node2D[]) {
    super();
    this.nodes = nodes;
    this.type = "plane";
  }

  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    const X = this.space.dscale();
    const Y = this.space.rscale();
    const W = interpolator([0, this.space.domainWidth], [0, this.space.vw]);
    const H = interpolator([0, this.space.rangeWidth], [0, this.space.vh]);
    const extraNodes: Node2D[] = [];
    this.nodes.forEach((n) => {
      if (isGroup(n)) {
        n.nodes.forEach((n) => extraNodes.push(n));
      } else {
        n.scope(this.space);
        isLine(n) && n.arrowed && this.defineArrow(n);
        if (isQuad(n) || isCircle(n)) {
          n.x = X(n.x);
          n.y = Y(n.y);
        }
        if (isQuad(n)) {
          n.H = H(n.H);
          n.W = W(n.W);
        }
      }
    });
    if (extraNodes.length) {
      extraNodes.forEach((n) => {
        this.nodes.push(n);
      });
    }
    return this;
  }
}

export const plane = (nodes: (Node2D | Node2D[])[]) => {
  return new Plane(nodes.flat());
};

export const isPlane = (node: FigNode): node is Plane => (
  !unsafe(node) && node.isType("plane")
);
