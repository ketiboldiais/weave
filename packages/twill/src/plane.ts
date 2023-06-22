import { isAngle, Space } from "./index.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./node.types.js";
import { isLine, Line } from "./line.js";
import { arrowDef } from "./index.js";
import { unsafe } from "./aux.js";

const PLANE = typed(Space);

export class Plane extends PLANE {
  nodes: Node2D[];
  constructor(nodes: Node2D[]) {
    super();
    this.nodes = nodes;
    this.type = "plane";
  }
  defineArrow(n: Line) {
    this.define(arrowDef().uid(n.id).copyColors(n));
    return this;
  }
  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    this.nodes.forEach((n) => {
      n.scope(this);
      // handle angles
      if (isAngle(n)) {
        n.initial.copyColors(n);
        n.terminal.copyColors(n);
        n.initial.scope(this);
        n.terminal.scope(this);
        n.terminal.isRay() && this.defineArrow(n.terminal);
        n.initial.isRay() && this.defineArrow(n.initial);
        n.children.forEach((l) => {
          l.scope(this);
          l.copyColors(n);
          if (isLine(l) && l.isRay()) {
            this.defineArrow(l);
          }
        });
      }
      // handle lines
      isLine(n) && n.isRay() && this.defineArrow(n);
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
