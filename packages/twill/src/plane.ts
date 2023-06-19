import { isAngle, isArc, Space, Vector } from "./index.js";
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
  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    const arrowDefine = (n: Line) => {
      (n.arrowed !== "none") &&
        this.define(
          arrowDef()
            .uid(n.id)
            .copyColors(n),
        );
    };
    this.nodes.forEach((n) => {
      n.scope(this);
      // handle arc children
      if (isArc(n)) {
        n.children.forEach(c => {
          c.scope(this);
        })
      }
      // handle angles
      if (isAngle(n)) {
        n.initial.copyColors(n);
        n.terminal.copyColors(n);
        n.initial.scope(this);
        n.terminal.scope(this);
        arrowDefine(n.terminal);
        arrowDefine(n.initial);
        if (n.marker) {
          n.marker.scope(this);
        }
      }
      // handle lines
      if (isLine(n)) {
        arrowDefine(n);
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
