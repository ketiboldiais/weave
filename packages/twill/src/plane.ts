import { isAngle, Space } from "./index.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./node.types.js";
import { isLine, Line } from "./line.js";
import { arrowDef } from "./index.js";
import { unsafe } from "./aux.js";

const PLANE = typed(Space);

export class CoordinateSpace extends PLANE {
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
      // handle angles
      if (isAngle(n)) {
        n.initial.copyColors(n);
        n.terminal.copyColors(n);
        n.initial.scope(this);
        n.terminal.scope(this);
        arrowDefine(n.terminal);
        arrowDefine(n.initial);
        n.children.forEach((l) => {
          l.scope(this);
          l.copyColors(n);
          if (isLine(l)) arrowDefine(l);
        });
      }
      // handle lines
      if (isLine(n)) {
        arrowDefine(n);
      }
    });
    return this;
  }
}

export class Plane extends CoordinateSpace {
  constructor(nodes: Node2D[]) {
    super(nodes);
    this.type = "plane";
  }
}

export class Polar extends CoordinateSpace {
  constructor(nodes: Node2D[]) {
    super(nodes);
    this.type = "polar-plane";
    this.scaletype = "radial";
    this.dom = [0,1];
    this.ran = [
      0,
      (Math.min(this.width, this.height) / 2) - this.marginX()/4,
    ];
  }
}

export const plane = (nodes: (Node2D | Node2D[])[]) => {
  return new Plane(nodes.flat());
};

export const polar = (nodes: (Node2D | Node2D[])[]) => {
  return new Polar(nodes.flat());
};

export const isPlane = (node: FigNode): node is Plane => (
  !unsafe(node) && node.isType("plane")
);
export const isPolar = (node: FigNode): node is Polar => (
  !unsafe(node) && node.isType("polar-plane")
);
