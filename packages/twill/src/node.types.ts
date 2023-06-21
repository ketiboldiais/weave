import {
  Angle,
  Arc,
  ArrowDefNode,
  Axis,
  Circle,
  Integral,
  Line,
  Plane,
  Plot,
  PolarAxis,
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
  | Arc
  | TreeSpace
  | TreeChild
  | ArrowDefNode
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
export type LayoutNode = Plane | TreeSpace;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
