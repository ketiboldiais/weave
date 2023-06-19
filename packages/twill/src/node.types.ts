import {
  Angle,
  ArrowDefNode,
  Axis,
  Circle,
  Integral,
  Line,
  Plane,
  Plot,
  Polygon,
  TextNode,
  TreeChild,
  TreeSpace,
} from "./index.js";

export type FigNode =
  | Plot
  | Angle
  | Circle
  | Plane
  | Axis
  | TextNode
  | Line
  | TreeSpace
  | TreeChild
  | ArrowDefNode
  | Polygon
  | Integral;

/**
 * A referable is any FigNode that
 * can be placed in a space’s definitions
 * array. Such nodes include:
 *
 * 1. {@link ArrowDefNode} - an arrow definition node.
 */
export type Referable = ArrowDefNode;
export type Node2D =
  | Plot
  | Axis
  | TextNode
  | Circle
  | Line
  | Angle
  | Polygon;
  
export type Plottable = Integral;
export type LayoutNode = Plane | TreeSpace;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
