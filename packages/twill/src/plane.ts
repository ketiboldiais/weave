import { isPath, Space, TextNode, Vector } from "./index.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./node.types.js";
import { isLine, Line } from "./line.js";
import { arrowDef, label } from "./index.js";
import { isnum, isstr, unsafe } from "./aux.js";

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
      this.define(arrowDef().uid(l.id).copyColors(l));
    }
  }
  /**
   * If called, ensures all child nodes
   * of this figure are properly formatted.
   */
  figure() {
    const extras: Node2D[] = [];
    const enline = (n: Line) => {
      this.handleLine(n);
      if (n.text !== undefined) {
        if (isnum(n.text) || isstr(n.text)) {
          const text = label(n.text);
          text.scope(this);
          const x = n.y2 - n.y2 / 2;
          const y = n.x2 - n.x2 / 2;
          text.PLACE(x, y);
          extras.push(text);
        } else {
          n.text.scope(this);
          extras.push(n.text);
        }
      }
      extras.push(n);
    };
    this.nodes.forEach((n) => {
      if (isPath(n)) {
        n.data.forEach((l) => {
          l.copyColors(n);
          enline(l);
        });
      }
      if (isLine(n)) {
        enline(n);
      }
      n.scope(this);
    });
    extras.forEach((n) => this.nodes.push(n));
    return this;
  }
}

export const plane = (nodes: (Node2D | Node2D[])[]) => {
  return new Plane(nodes.flat());
};

export const isPlane = (node: FigNode): node is Plane => (
  !unsafe(node) && node.isType("plane")
);
