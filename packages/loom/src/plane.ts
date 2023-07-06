import { Space2D } from "./index.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./index.js";
import { isLine } from "./geometries/line.js";
import { unsafe } from "./aux.js";

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
    this.nodes.forEach((n) => {
      n.scope(this);
      isLine(n) && n.arrowed && this.defineArrow(n);
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

