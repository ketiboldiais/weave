export { Space } from "./space.js";
export { linear, LinearScale } from "./scale.js";
import { Angle } from "./angle.js";
import { ArrowDefNode } from "./arrow.js";
import { PolarAxis } from "./axis.js";
import { Circle } from "./circle.js";
import { Integral } from "./integral.js";
import { Plane } from "./plane.js";
import { Plot } from "./plot.js";
import { Polygon } from "./polygon.js";
import { TextNode } from "./text.js";
import { TreeSpace } from "./tree.js";
import { TreeChild } from "./treenode.js";
export { Space2D } from "./space2d.js";
export type { ScaleFn } from "./space2d.js";
export { arrow, isLine, line } from "./line.js";
export type { Line } from "./line.js";
export { v2, v3, Vector, vector, vray } from "./vector.js";
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
export { Axis, axis, isAxis, isPolarAxis, PolarAxis } from "./axis.js";
export type { TextNode } from "./text.js";
export { isTextNode, label, latex, tex } from "./text.js";
export { isTreeSpace, tree, TreeSpace } from "./tree.js";
export { isLeaf, isTree, leaf, subtree } from "./treenode.js";
export type { LeafNode, Tree, TreeChild } from "./treenode.js";
export { area, Circle, circle, isCircle } from "./circle.js";
export { isPolygon, polygon, rect } from "./polygon.js";
export type { Polygon } from "./polygon.js";
export { clamp, randFloat, randInt, round, toDeg, toRadians } from "./aux.js";
export { Angle, angle, isAngle } from "./angle.js";
export { Arc, arc, isArc } from "./arc.js";
export { diagonal, Matrix, matrix } from "./matrix.js";
export { Vertex, vtx } from "./graph/vertex.js";
export { Edge, edge } from "./graph/edge.js";
export { Graph, graph } from "./graph/graph.js";
export {
  ForceSpace,
  forceSpace,
  isForceSpace,
  Particle,
  pt,
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

import type { Line } from "./line.js";
import type { Arc } from "./arc.js";
import { Axis } from "./axis.js";
import { ForceSpace, Particle } from "./graph/graph.spring.js";

export type FigNode =
  | Plot
  | Angle
  | Circle
  | Plane
  | Axis
  | TextNode
  | Line
  | Arc
  | TreeSpace
  | TreeChild
  | ArrowDefNode
  | Particle
  | ForceSpace
  | Polygon
  | PolarAxis
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
  | PolarAxis
  | TextNode
  | Circle
  | Line
  | Arc
  | Angle
  | Polygon;

export type Plottable = Integral;
export type LayoutNode = Plane | TreeSpace | ForceSpace;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
