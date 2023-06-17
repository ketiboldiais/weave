import {
  ArrowDefNode,
  Axis,
  Circle,
  Eades,
  Integral,
  Line,
  Path,
  Plane,
  Plot,
  Polygon,
  TextNode,
  TreeChild,
  TreeSpace,
} from "./index.js";

export type FigNode =
  | Plot
  | Circle
  | Plane
  | Axis
  | TextNode
  | Line
  | TreeSpace
  | TreeChild
  | ArrowDefNode
  | Eades
  | Polygon
  | Path
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
  | Path
  | Polygon;
export type Plottable = Integral;
export type LayoutNode = Plane | TreeSpace | Eades;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
