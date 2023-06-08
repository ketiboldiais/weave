import {
  ScaleLinear,
  scaleLinear,
  scaleLog,
  ScaleLogarithmic,
  scalePow,
  ScalePower,
  ScaleRadial,
  scaleRadial,
} from "d3";
import { line, LineNode, shift } from "./index.js";
import { tuple } from "./aux.js";
import { Referable } from "./node.types.js";

export type ScaleName = "linear" | "power" | "radial" | "log";
export type LinearScale = ScaleLinear<number, number, never>;
export type PowerScale = ScalePower<number, number, never>;
export type RadialScale = ScaleRadial<number, number, never>;
export type LogScale = ScaleLogarithmic<number, number, never>;
export type Scaler = LinearScale | PowerScale | RadialScale | LogScale;

export class Space {
  scaletype: ScaleName = "linear";
  GridLines: LineNode[] = [];
  
  /**
   * An array of {@link Referable} nodes.
   * Definitions provide data objects for
   * SVG `<def>` tags. _See_
   * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs}
   */
  definitions: Referable[] = [];

  /**
   * Inserts the provided {@link Referable} node
   * in the {@link Space.definitions}.
   */
  define(node:Referable) {
    this.definitions.push(node);
    return this;
  }
  /**
   * Sets gridlines on the space.
   * @param on - The axis to render gridlines on. Either `x`,
   * `y`, or `xy`.
   *
   * @param callback - An optional callback to modify the lines
   * _before scaling_. Thus, the values are as they would appear
   * visually, depending on the domain and range.
   */
  gridlines(on: "x" | "y" | "xy", callback?: (line: LineNode) => LineNode) {
    const xmin = this.xmin();
    const xmax = this.xmax();
    const ymin = this.ymin();
    const ymax = this.ymax();
    const xscale = this.scaleOf("x");
    const yscale = this.scaleOf("y");
    if (on === "xy" || on === "x") {
      const xi = Math.floor(xmin);
      const xf = Math.floor(xmax);
      for (let i = xi; i <= xf; i++) {
        let gridline = line(i, ymin, i, ymax);
        if (callback) {
          gridline = callback(gridline);
        }
        gridline.x1 = xscale(gridline.x1);
        gridline.x2 = gridline.x1;
        gridline.y1 = yscale(gridline.y1);
        gridline.y2 = yscale(gridline.y2);
        this.GridLines.push(gridline);
      }
    }
    if (on === "xy" || on === "y") {
      const yi = Math.floor(ymin);
      const yf = Math.floor(ymax);
      for (let j = yi; j <= yf; j++) {
        let gridline = line(xmin, j, xmax, j);
        if (callback) {
          gridline = callback(gridline);
        }
        gridline.x1 = xscale(gridline.x1);
        gridline.x2 = xscale(gridline.x2);
        gridline.y1 = yscale(gridline.y1);
        gridline.y2 = gridline.y1;
        this.GridLines.push(gridline);
      }
    }
    return this;
  }

  xmin() {
    return this.dom[0];
  }
  xmax() {
    return this.dom[1];
  }
  ymin() {
    return this.ran[0];
  }
  ymax() {
    return this.ran[1];
  }
  scale() {
    const type = this.scaletype;
    switch (type) {
      case "linear":
        return scaleLinear;
      case "log":
        return scaleLog;
      case "power":
        return scalePow;
      case "radial":
        return scaleRadial;
      default:
        return scaleLinear;
    }
  }
  scaled(type: ScaleName) {
    this.scaletype = type;
    return this;
  }
  width: number = 500;
  height: number = 500;
  size(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }
  margins: [number, number, number, number] = [50, 50, 50, 50];
  margin(
    top: number,
    right: number,
    bottom: number = top,
    left: number = right,
  ) {
    this.margins[0] = top;
    this.margins[1] = right;
    this.margins[2] = bottom;
    this.margins[3] = left;
    return this;
  }
  marginOf(order: "top" | "right" | "bottom" | "left") {
    switch (order) {
      case "top":
        return this.margins[0];
      case "right":
        return this.margins[1];
      case "bottom":
        return this.margins[2];
      case "left":
        return this.margins[3];
      default:
        return 50;
    }
  }
  boxed(dimension: "height" | "width") {
    if (dimension === "height") {
      const height = this.height;
      const top = this.marginOf("top");
      const bottom = this.marginOf("bottom");
      return height - top - bottom;
    } else {
      const width = this.width;
      const left = this.marginOf("left");
      const right = this.marginOf("right");
      return width - left - right;
    }
  }

  dom: [number, number] = [-10, 10];
  domain(value: [number, number]) {
    this.dom = value;
    return this;
  }
  ran: [number, number] = [-10, 10];
  range(value: [number, number]) {
    this.ran = value;
    return this;
  }
  center() {
    const mx = this.marginOf("left") + this.marginOf("right");
    const my = this.marginOf("top") + this.marginOf("bottom");
    return shift(mx / 2, my / 2);
  }
  axisDomain(of: "x" | "y") {
    if (of === "x") {
      return this.dom;
    } else {
      return this.ran;
    }
  }
  axisRange(of: "x" | "y") {
    if (of === "x") {
      return tuple(0, this.boxed("width"));
    } else {
      return tuple(this.boxed("height"), 0);
    }
  }
  scaleOf(of: "x" | "y", Domain?: [number, number], Range?: [number, number]) {
    const domain = Domain ? Domain : this.dom;
    const range = Range ? Range : this.ran;
    const width = this.boxed("width");
    const height = this.boxed("height");
    const xdomain = tuple(0, width);
    const ydomain = tuple(height, 0);
    const scale = this.scale();
    if (of === "y") {
      return scale().domain(range).range(ydomain);
    } else {
      return scale().domain(domain).range(xdomain);
    }
  }
}
