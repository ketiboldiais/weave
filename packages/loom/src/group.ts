import { interpolator } from "@weave/math";
import {
  CoordSpace,
  definable,
  FigNode,
  isCircle,
  isLine,
  isQuad,
  Node2D,
  space,
} from ".";
import { unsafe } from "./aux";
import { Base } from "./base";
import { typed } from "./mixins/typed";

const GROUP = typed(definable(Base));

export class Group extends GROUP {
  nodes: Node2D[];
  constructor(nodes: Node2D[]) {
    super();
    this.nodes = nodes;
    this.type = "group";
  }
  ctx(coordSpace?: CoordSpace) {
    this.space = coordSpace ? coordSpace : space();
    const X = this.space.dscale();
    const Y = this.space.rscale();
    const W = interpolator([0, this.space.domainWidth], [0, this.space.vw]);
    const H = interpolator([0, this.space.rangeWidth], [this.space.vh,0]);
    this.nodes.forEach((node) => {
      if (!isGroup(node)) {
        node.scope(this.space);
        node.scope(this.space);
        isLine(node) && node.arrowed && this.defineArrow(node);
        if (isQuad(node) || isCircle(node)) {
          node.x = X(node.x);
          node.y = Y(node.y);
        }
        if (isQuad(node)) {
          node.H = H(node.H);
          node.W = W(node.W);
        }
      }
    });
    return this;
  }
}

export const group = (nodes: Node2D[]) => (
  new Group(nodes)
);

export const isGroup = (node: FigNode): node is Group => (
  !unsafe(node) && node.isType("group")
);
