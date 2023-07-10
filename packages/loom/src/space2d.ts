import { interpolator, Vector, vector } from "@weave/math";
import { arrowDef, Line, line, Referable, shift, Space } from "./index.js";

export type ScaleName = "linear" | "power" | "radial" | "log";
export type ScaleFn = (x: number) => number;


export class Space2D extends Space {
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

  scaled(type: ScaleName) {
    this.scaletype = type;
    return this;
  }

  image(of: "x" | "y"): Vector {
    switch (of) {
      case "x":
        return this.X;
      case "y":
        return this.Y;
      default:
        return this.X;
    }
  }

  X: Vector = vector(-10, 10);
  Y: Vector = vector(-10, 10);

  /**
   * Sets the minimum and maximum
   * x-values for this space.
   */
  x(min: number, max: number) {
    if (min < max) {
      this.X = Vector.from([min, max]);
    }
    return this;
  }

  /**
   * Sets the minimum and maximum
   * y-values for this space.
   */
  y(min: number, max: number) {
    if (min < max) {
      this.Y = Vector.from([min, max]);
    }
    return this;
  }
  amplitude(of: "x" | "y") {
    switch (of) {
      case "x":
        return this.X.y - this.X.x;
      case "y":
        return this.Y.y - this.Y.x;
      default:
        return 0;
    }
  }
  center() {
    const mx = this.marginX;
    const my = this.marginY;
    let out = shift(mx / 2, my / 2);
    return out;
  }
  scaleOf(of: "x" | "y"): ScaleFn {
    const width = this.vw;
    const height = this.vh;
    const xdomain = [0, width];
    const ydomain = [height, 0];
    if (of === "y") {
      return interpolator(
        this.Y.array() as [number, number],
        ydomain as [number, number],
      );
    } else {
      return interpolator(
        this.X.array() as [number, number],
        xdomain as [number, number],
      );
    }
  }
}
