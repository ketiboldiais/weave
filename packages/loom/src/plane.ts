import { isCircle, isPath, isQuad, Space2D } from "./index.js";
import { typed } from "./mixins/typed.js";
import { FigNode, Node2D } from "./index.js";
import { isLine } from "./geometries/line.js";
import { unsafe } from "./aux.js";
import { interpolator, max } from "@weave/math";

const PLANE = typed(Space2D);

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
    const X = this.scaleOf("x");
    const Y = this.scaleOf("y");
    const W = interpolator([0, this.xmax()-this.xmin()], [0, this.vw]);
    const H = interpolator([0, this.ymax()-this.ymin()], [0, this.vh]);
    this.nodes.forEach((n) => {
      n.scope(this);
      isLine(n) && n.arrowed && this.defineArrow(n);
      if (isQuad(n) || isCircle(n)) {
        n.x = X(n.x);
        n.y = Y(n.y);
      }
      if (isQuad(n)) {
        n.H = H(n.H);
        n.W = W(n.W);
      }
    });
    return this;
  }
}

export const plane = (nodes: (Node2D | Node2D[])[]) => {
  return new Plane(nodes.flat());
};

export const isPlane = (node: FigNode): node is Plane => (
  !unsafe(node) && node.isType("plane")
);
