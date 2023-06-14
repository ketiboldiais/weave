export type { Scaler } from "./space.js";
export { Space } from "./space.js";
export { line, isLine } from "./line.js";
export type { LineNode } from "./line.js";
export { vector } from "./vector.js";
export type { Vector } from "./vector.js";
export { arrowDef, isArrow } from "./arrow.js";
export type { ArrowDefNode } from "./arrow.js";
export { isPlane, Plane, plane } from "./plane.js";
export type { PlaneNode } from "./plane.js";
export { isPlot, Plot, plot } from "./plot.js";
export { integral, isIntegral } from "./integral.js";
export type { IntegralNode } from "./integral.js";
export type Layout = "tree" | "graph" | "plane" | "3d";
export { uid } from "./aux.js";
export { shift } from "./path.js";
export type Axiom<T = {}> = new (...args: any[]) => T;
export type { Colorable } from "./colorable.js";
export type And<DataClass, Extender> = DataClass &
  Axiom<Extender>;
export type { PlotNode } from "./plot.js";
export type { AxisNode } from "./axis.js";
export { axis, isAxis } from "./axis.js";
export type {
  FigNode,
  LayoutNode,
  Node2D,
  Plottable,
} from "./node.types.js";
export type { TextNode } from "./text.js";
export { isTextNode, label, latex, tex } from "./text.js";
export { tree, isTreeSpace } from "./tree.js";
export type { TreeSpaceNode } from "./tree.js";
export {
  leaf,
  subtree,
  isLeaf,
  isTree,
} from "./treenode.js";
export type {
  LeafNode,
  Tree,
  TreeChild,
} from "./treenode.js";
export {
  edge,
  vertex,
  graph,
  isVertex,
  isEdge,
  isGraph,
} from "./graph.js";
export type { Edge, Vertex, Graph } from "./graph.js";

export type NodeType =
  | "plane"
  | "matrix"
  | "plot"
  | "point"
  | "axis"
  | "graph"
  | "vertex"
  | "edge"
  | "link"
  | "leaf"
  | "branch"
  | "tree"
  | "subtree"
  | "integral"
  | "path"
  | "angle"
  | "text"
  | "line"
  | "vector2D"
  | "arrow"
  | "unknown";
