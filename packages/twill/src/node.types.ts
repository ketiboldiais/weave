import {
  Angle,
  Arc,
  ArrowDefNode,
  Axis,
  Axis3D,
  Circle,
  Integral,
  Line,
  Plane,
  Plot,
  Point3D,
  PolarAxis,
  Polygon,
  Ray3,
  Space3D,
  TextNode,
  TreeChild,
  TreeSpace,
} from "./index.js";

export type FigNode =
  | Plot
  | Axis3D
  | Angle
  | Circle
  | Plane
  | Axis
  | TextNode
  | Space3D
  | Line
  | Arc
  | TreeSpace
  | TreeChild
  | ArrowDefNode
  | Polygon
  | PolarAxis
  | Ray3
  | Point3D
  | Integral;

/**
 * A referable is any FigNode that
 * can be placed in a space’s definitions
 * array. Such nodes include:
 *
 * 1. {@link ArrowDefNode} - an arrow definition node.
 */
export type Referable = ArrowDefNode;

export type Node3D = 
  | Ray3
  | Point3D
  | Axis3D

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
export type LayoutNode = Plane | TreeSpace | Space3D;
export type Coord = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
