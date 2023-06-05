import { Space } from "./space.js";
import { typed } from "./typed.js";
import { FigNode, Node2D } from "./node.types.js";

export class Plane extends Space {
  nodes: Node2D[];
  constructor(nodes: Node2D[]) {
    super();
    this.nodes = nodes;
  }
  children() {
    this.nodes.forEach((n) => n.scope(this));
    return this.nodes;
  }
}

export const plane = (nodes: Node2D[]) => {
  const fig = typed(Plane);
  return new fig(nodes).typed("plane");
};

export type PlaneNode = ReturnType<typeof plane>;
export const isPlane = (node: FigNode): node is PlaneNode => (
  node.type === "plane"
);
