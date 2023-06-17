export { Space } from "./space.js";
export type { Scaler } from "./space.js";
export {
  linearScale,
  logScale,
  powerScale,
  radialScale,
  sqrtScale,
} from "./space.js";
export { isLine, line } from "./line.js";
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
export { textual } from "./textual.js";
export type { Textual } from "./textual.js";
export type And<DataClass, Extender> = DataClass & Axiom<Extender>;
export type { PlotNode } from "./plot.js";
export type { AxisNode } from "./axis.js";
export { axis, isAxis } from "./axis.js";
export type { FigNode, LayoutNode, Node2D, Plottable } from "./node.types.js";
export type { TextNode } from "./text.js";
export { isTextNode, label, latex, tex } from "./text.js";
export { isTreeSpace, tree } from "./tree.js";
export type { TreeSpaceNode } from "./tree.js";
export { isLeaf, isTree, leaf, subtree } from "./treenode.js";
export type { LeafNode, Tree, TreeChild } from "./treenode.js";
export { area, circle, isCircle } from "./circle.js";
export type { CircleNode } from "./circle.js";
export { edge, graph, vertex } from "./graph.js";
export { eades, isEades } from "./graph.spring.js";
export type { Eades } from "./graph.spring.js";
export { isPolygon, polygon } from "./polygon.js";
export type { Polygon } from "./polygon.js";
export { clamp, randFloat, randInt, round, toDeg, toRadians } from "./aux.js";
export type NodeType =
  | "plane"
  | "matrix"
  | "particle"
  | "plot"
  | "point"
  | "polygon"
  | "axis"
  | "link"
  | "leaf"
  | "edge"
  | "vertex"
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
  | "circle"
  | "force-spring"
  | "force-spring-graph"
  | "unknown";
