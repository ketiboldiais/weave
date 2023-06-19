import { Space } from "./index.js";
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
  handleLine(l: Line) {
    l.scope(this);
    if (l.arrowed !== "none") {
    }
  }
  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    this.nodes.forEach((n) => {
      n.scope(this);
      if (isLine(n) && n.arrowed!=='none') {
        this.define(arrowDef()
          .uid(n.id)
          .copyColors(n)
        );
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
