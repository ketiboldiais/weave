import {
  AxisNode,
  IntegralNode,
  SpringGraph,
  PlaneNode,
  PlotNode,
  TextNode,
  ArrowDefNode,
  LineNode,
  TreeSpaceNode,
  TreeChild,
  Particle,
  Spring,
} from './index.js';

export type FigNode =
  | PlotNode
  | PlaneNode
  | AxisNode
  | TextNode
  | LineNode
  | TreeSpaceNode
  | TreeChild
  | Particle
  | Spring
  | SpringGraph
  | ArrowDefNode
  | IntegralNode;

/**
 * A referable is any FigNode that
 * can be placed in a space’s definitions
 * array. Such nodes include:
 *
 * 1. {@link ArrowDefNode} - an arrow definition node.
 */
export type Referable = ArrowDefNode;
export type Node2D = PlotNode | AxisNode | TextNode;
export type Plottable = IntegralNode;
export type LayoutNode = PlaneNode | TreeSpaceNode | SpringGraph;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
