export { Space } from "./space.js";
export type { Scaler } from "./space.js";
export { line, isLine } from "./line.js";
export type { LineNode } from "./line.js";
export { arrowDef } from "./arrow.js";

export {} from './tree.js';
export type {} from './tree.js';

export type { ArrowDefNode } from "./arrow.js";
export { link } from "./dlink.js";
export type { LinkNode, Linkable } from "./dlink.js";
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
  | "branch"
  | "tree"
  | "subtree"
  | "integral"
  | "path"
  | "angle"
  | "text"
  | "line"
  | "vector2D"
  | "unknown";
