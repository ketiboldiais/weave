import { Space, Vector } from "./index.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./node.types.js";
import { isLine } from "./line.js";
import { arrowDef, label } from "./index.js";
import { isnum, isstr } from "./aux.js";

export class Plane extends Space {
  nodes: Node2D[];
  constructor(nodes: Node2D[]) {
    super();
    this.nodes = nodes;
  }
  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    const extras: Node2D[] = [];
    this.nodes.forEach((n) => {
      if (isLine(n)) {
        if (n.arrowed!=='none') {
          this.define(arrowDef().uid(n.id).copyColors(n));
        }
        if (n.text !== undefined) {
          if (isnum(n.text) || isstr(n.text)) {
            const text = label(n.text);
            text.scope(this);
            const x = n.y2 - n.y2 / 2;
            const y = n.x2 - n.x2 / 2;
            text.place(x, y);
            extras.push(text);
          } else {
            n.text.scope(this);
            extras.push(n.text);
          }
        }
      }
      n.scope(this);
    });
    extras.forEach((n) => this.nodes.push(n));
    return this;
  }
}

const PLANE_NODE = typed(Plane);
export const plane = (nodes: (Node2D | Node2D[])[]) => {
  return new PLANE_NODE(nodes.flat()).typed("plane");
};

export type PlaneNode = ReturnType<typeof plane>;
export const isPlane = (node: FigNode): node is PlaneNode => (
  node.type === "plane"
);
