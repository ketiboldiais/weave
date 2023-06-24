import { scaleLinear, scaleLog, scalePow, scaleRadial, scaleSqrt } from "d3-scale";
import { Line, line, shift, Vector, vector, Referable, arrowDef } from "./index.js";

export type ScaleName = "linear" | "power" | "radial" | "log";
export type ScaleFn = (x: number) => number;

/**
 * Returns a d3 linear scale.
 */
export const linearScale = (domain: number[], range: number[]) => (
  scaleLinear().domain(domain).range(range)
);
type LinearScale = typeof linearScale;

/**
 * Returns a d3 power scale. An optional power value maybe passed
 * (the exponent the domain values will be raised to). By default,
 * the exponent is set to 2. Note that a power of 1 is simply a linear
 * scale. Power scales are seldom used, but they’re necessary for
 * circle-like figures that require scaling via radius.
 */
export const powerScale = (
  domain: number[],
  range: number[],
  power: number = 2,
) => (
  scalePow().exponent(power).domain(domain).range(range)
);
type PowerScale = typeof powerScale;

/**
 * Returns a d3 radial scale.
 */
export const radialScale = (domain: number[], range: number[]) => (
  scaleRadial().domain(domain).range(range)
);
type RadialScale = typeof radialScale;

/**
 * Return a d3 sqrt scale.
 */
export const sqrtScale = (domain: number[], range: number[]) => (
  scaleSqrt().domain(domain).range(range)
);
type SqrtScale = typeof sqrtScale;

/**
 * Returns a d3 log scale.
 */
export const logScale = (domain: number[], range: number[]) => (
  scaleLog().domain(domain).range(range)
);
type LogScale = typeof logScale;

export type Scaler =
  | LinearScale
  | PowerScale
  | RadialScale
  | SqrtScale
  | LogScale;

export class Space {
  scaletype: ScaleName = "linear";
  GridLines: Line[] = [];

  /**
   * An array of {@link Referable} nodes.
   * Definitions provide data objects for
   * SVG `<def>` tags. _See_
   * {@link https://developer.mozilla.org/en-US/docs/Web/SVG/Element/defs}
   */
  definitions: Referable[] = [];

  
  defineArrow(n: Line) {
    this.define(arrowDef().uid(n.id).copyColors(n));
    return this;
  }

  /**
   * Inserts the provided {@link Referable} node
   * in the {@link Space.definitions}.
   */
  define(node: Referable) {
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
  gridlines(on: "x" | "y" | "xy", callback?: (line: Line) => Line) {
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
        let gridline = line([i, ymin], [i, ymax]);
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
        let gridline = line([xmin, j], [xmax, j]);
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
    return this.X.x;
  }
  xmax() {
    return this.X.y;
  }
  ymin() {
    return this.Y.x;
  }
  ymax() {
    return this.Y.y;
  }
  marginY() {
    return this.marginOf("top") + this.marginOf("bottom");
  }
  marginX() {
    return this.marginOf("left") + this.marginOf("right");
  }
  scale(): Scaler {
    const type = this.scaletype;
    switch (type) {
      case "linear":
        return linearScale;
      case "log":
        return logScale;
      case "power":
        return powerScale;
      case "radial":
        return radialScale;
      default:
        return linearScale;
    }
  }
  scaled(type: ScaleName) {
    this.scaletype = type;
    return this;
  }
  width: number = 500;
  height: number = 500;
  /**
   * Sets the figure’s physical size/
   */
  size(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  image(of: "x" | "y" | "z"): Vector {
    switch (of) {
      case "x":
        return this.X;
      case "y":
        return this.Y;
      case "z":
        return this.Z;
      default:
        return this.X;
    }
  }

  /**
   * Sets the figure’s margins.
   */
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
  Z: Vector = vector(-10, 10);
  /**
   * Sets the minimum and maximum
   * z-values for this space.
   */
  z(min: number, max: number) {
    if (min < max) this.Z = Vector.from([min, max]);
    return this;
  }
  X: Vector = vector(-10, 10);

  /**
   * Sets the minimum and maximum
   * x-values for this space.
   */
  x(min: number, max: number) {
    if (min < max) this.X = Vector.from([min, max]);
    return this;
  }

  Y: Vector = vector(-10, 10);
  /**
   * Sets the minimum and maximum
   * y-values for this space.
   */
  y(min: number, max: number) {
    if (min < max) this.Y = Vector.from([min, max]);
    return this;
  }
  amplitude(of:'x'|'y'|'z') {
    switch (of) {
      case 'x': return this.X.y - this.X.x;
      case 'y': return this.Y.y - this.Y.x;
      case 'z': return this.Z.y - this.Z.x;
      default: return 0;
    }
  }
  center() {
    const mx = this.marginX();
    const my = this.marginY();
    let out = shift(mx / 2, my / 2);
    return out;
  }

  /**
   * Returns a scale along either the x- or y-axis, based
   * on the current scale type. Two optional
   * parameters may be passed: An interval domain, and an interval range.
   * If a domain is passed, that domain will be used for the scaling function.
   * Likewise, if a range is passed, that range will be used for the scaling
   * function. If neither parameters are passed, this space’s current domain
   * and range are used.
   */
  scaleOf(of: "x" | "y" | "z"): ScaleFn {
    const width = this.boxed("width");
    const height = this.boxed("height");
    const xdomain = [0, width];
    const ydomain = [height, 0];
    const scale = this.scale();
    if (of === "y") {
      return scale(this.Y.array(), ydomain);
    } else if (of === "x") {
      return scale(this.X.array(), xdomain);
    } else {
      const zdomain = [0, Math.sqrt((width * width) + (height * height))];
      return scale(this.Z.array(), zdomain);
    }
  }
}
