export { Color, color, hsl, rgb } from "./color.js";
export { BNode, bnode } from "./nodes/bnode.js";
export { map, none, some } from "./nodes/box.js";
export type { Option } from "./nodes/box.js";
export {
  A,
  C,
  comHandler,
  H,
  L,
  M,
  P,
  pathScaler,
  pathStringer,
  Q,
  S,
  T,
  transformer2D,
  V,
  Z,
} from "./geometries/pathcoms.js";
export { Space } from "./space.js";
export { circ, group, isPath, Path, path, rect } from "./geometries/path.js";
export { linear, LinearScale } from "./scale.js";
import { ArrowDefNode } from "./arrow.js";
import { Circle } from "./geometries/circle.js";
import { Integral } from "./integral.js";
import { Plane } from "./plane.js";
import { Plot } from "./plot.js";
import { TextNode } from "./text.js";
import { TreeSpace } from "./tree.js";
import { TreeChild } from "./treenode.js";
export { Space2D } from "./space2d.js";
export { bst } from "./tree/tree.binary.js";
export type { ScaleFn } from "./space2d.js";
export { arrow, isLine, line } from "./geometries/line.js";
export type { Line } from "./geometries/line.js";
export { arrowDef, isArrow } from "./arrow.js";
export type { ArrowDefNode } from "./arrow.js";
export { isPlane, Plane, plane } from "./plane.js";
export { isPlot, Plot, plot, polar } from "./plot.js";
export { integral, isIntegral } from "./integral.js";
export type { Integral } from "./integral.js";
export { shift, uid } from "./aux.js";
export type Axiom<T = {}> = new (...args: any[]) => T;
export type { Colorable } from "./colorable.js";
export { textual } from "./textual.js";
export type { Textual } from "./textual.js";
export type And<DataClass, Extender> = DataClass & Axiom<Extender>;
export { Axis, axis, isAxis } from "./axis.js";
export type { TextNode } from "./text.js";
export { isTextNode, label, latex, tex } from "./text.js";
export { isTreeSpace, tree, TreeSpace } from "./tree.js";
export { isLeaf, isTree, leaf, subtree } from "./treenode.js";
export type { LeafNode, Tree, TreeChild } from "./treenode.js";
export { area, Circle, circle, isCircle } from "./geometries/circle.js";
export { Vertex, vtx } from "./graph/vertex.js";
export { Edge, edge } from "./graph/edge.js";
export { Graph, graph } from "./graph/graph.js";
export {
  ForceSpace,
  forceSpace,
  isForceSpace,
  Particle,
} from "./graph/graph.spring.js";
export type NodeType =
  | "plane"
  | "space-3D"
  | "axis-3D"
  | "arc"
  | "ray-3D"
  | "polar-plane"
  | "matrix"
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
  | "vector"
  | "arrow"
  | "circle"
  | "polar-axis"
  | "point-3D"
  | "graph-simple"
  | "graph-directed"
  | "force-graph"
  | "force-spring"
  | "force-particle"
  | "unknown";

import type { Line } from "./geometries/line.js";
import { Axis } from "./axis.js";
import { ForceSpace, Particle } from "./graph/graph.spring.js";
import { Path } from "./geometries/path.js";

export type FigNode =
  | Plot
  | Circle
  | Path
  | Plane
  | Axis
  | TextNode
  | Line
  | TreeSpace
  | TreeChild
  | ArrowDefNode
  | Particle
  | ForceSpace
  | Integral;

/**
 * A referable is any FigNode that
 * can be placed in a space’s definitions
 * array. Such nodes include:
 *
 * 1. {@link ArrowDefNode} - an arrow definition node.
 */
export type Referable = ArrowDefNode;

export type Node3D = Line;

export type Node2D =
  | Plot
  | Axis
  | TextNode
  | Path
  | Circle
  | Line;

export type Plottable = Integral;
export type LayoutNode = Plane | TreeSpace | ForceSpace;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
