export { Space } from "./space.js";
export { isPlane, Plane, plane } from "./plane.js";
export type { PlaneNode } from "./plane.js";
export { Plot, plot } from "./plot.js";
export type Layout = "tree" | "graph" | "plane" | "3d";
export { uid } from "./aux.js";
export { shift } from "./path.js";
export type Axiom<T = {}> = new (...args: any[]) => T;
export type { Colorable } from "./colorable.js";
export type And<DataClass, Extender> = DataClass & Axiom<Extender>;
export type { PlotNode } from "./plot.js";
export type { AxisNode } from "./axis.js";
export { axis, isAxis } from "./axis.js";
export type { FigNode, LayoutNode, Node2D } from "./node.types.js";
export type { TextNode } from "./text.js";
export { label, tex } from "./text.js";
export type { Spatial2D } from "./spatial2D.js";
export { spatial2D } from "./spatial2D.js";
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
  | "tree"
  | "integral"
  | "path"
  | "angle"
  | "text"
  | "vector2D"
  | "unknown";
