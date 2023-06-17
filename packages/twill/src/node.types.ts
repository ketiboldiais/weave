import {
  ArrowDefNode,
  AxisNode,
  CircleNode,
  Eades,
  IntegralNode,
  LineNode,
  PlaneNode,
  PlotNode,
  Polygon,
  TextNode,
  TreeChild,
  TreeSpaceNode,
} from "./index.js";

export type FigNode =
  | PlotNode
  | CircleNode
  | PlaneNode
  | AxisNode
  | TextNode
  | LineNode
  | TreeSpaceNode
  | TreeChild
  | ArrowDefNode
  | Eades
  | Polygon
  | IntegralNode;

/**
 * A referable is any FigNode that
 * can be placed in a space’s definitions
 * array. Such nodes include:
 *
 * 1. {@link ArrowDefNode} - an arrow definition node.
 */
export type Referable = ArrowDefNode;
export type Node2D = PlotNode | AxisNode | TextNode | CircleNode | LineNode | Polygon;
export type Plottable = IntegralNode;
export type LayoutNode = PlaneNode | TreeSpaceNode | Eades;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
