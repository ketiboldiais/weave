import { FigNode, label, Line, line, shift, TextNode } from "./index.js";
import { tuple, unsafe } from "./aux.js";
import { colorable } from "./mixins/colorable.js";
import { typed } from "./mixins/typed.js";
import { scopable } from "./mixins/scopable.js";
import { Base } from "./base.js";
import { interpolator } from "@weave/math";

const range = (start: number, stop: number, step = 1): number[] =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) =>
    x + y * step
  );

const AXIS_BASE = scopable(typed(colorable(Base)));
type TickData = { line: Line; text: TextNode };
const tick = (line: Line, text: TextNode): TickData => ({
  line,
  text,
});

export class Axis extends AXIS_BASE {
  /**
   * @property
   * Indicates whether this axis runs
   * along the x, y, or z direction.
   */
  readonly direction: "x" | "y";
  tickFormat: "F" | "Q" = "F";

  constructor(direction: "x" | "y") {
    super();
    this.type = "axis";
    this.direction = direction;
  }

  axisLine() {
    const range = this.range();
    const tickLength = this.TickLength;
    return [
      "M",
      range[0],
      tickLength,
      "v",
      -tickLength,
      "H",
      range[1],
      "v",
      tickLength,
    ].join(" ");
  }

  /**
   * @method
   * Returns true if this axis is
   * of the provided type.
   */
  is(direction: "x" | "y") {
    return this.direction === direction;
  }
  hiddens: Set<string> = new Set();
  hide(option: "ticks" | "zero" | "axis-line") {
    this.hiddens.add(option);
    return this;
  }
  hasNo(option: "ticks" | "zero" | "axis-line") {
    return this.hiddens.has(option);
  }
  domain() {
    const space = this.space();
    const domain = this.is("x")
      ? tuple(space.domainMin, space.domainMax)
      : tuple(space.rangeMin, space.rangeMax);
    return domain;
  }
  range() {
    const space = this.space();
    const width = space.vw;
    const height = space.vh;
    const range = this.is("x") ? tuple(0, width) : tuple(height, 0);
    return range;
  }
  scaleFn() {
    const domain = this.domain();
    const range = this.range();
    const out = interpolator(domain, range);
    return out;
  }
  translationXY() {
    const space = this.space();
    const xscale = space.dscale();
    const yscale = space.rscale();
    if (this.is("y")) {
      return shift(xscale(0), 0);
    } else {
      return shift(0, yscale(0));
    }
  }

  ticksep: number = 1;

  /**
   * Sets the amount of separaton
   * between the ticks along
   * this axis.
   */
  sep(value: number) {
    if (value > 0) {
      this.ticksep = value;
    }
    return this;
  }

  TickLength: number = 2;

  tickLength(value: number) {
    this.TickLength = value;
    return this;
  }
  TickLabels: TextNode[] = [];

  tickPrecision: number = 2;

  /**
   * Sets the precision for
   * tick labels, if any.
   * Defaults to 2.
   */
  precision(value: number) {
    this.tickPrecision = value;
    return this;
  }

  tickData() {
    const space = this.space();
    const xmin = space.domainMin;
    const xmax = space.domainMax;
    const ymin = space.rangeMin;
    const ymax = space.rangeMax;
    const X = space.dscale();
    const Y = space.rscale();
    const ticks: TickData[] = [];
    const t = this.TickLength;
    const k = this.ticksep;
    if (this.direction === "x") {
      const xi = Math.floor(xmin);
      const xf = Math.floor(xmax);
      let xs = range(xi, xf + 1, k);
      if (this.hasNo("zero")) {
        xs = xs.filter((n) => n !== 0);
      }
      xs.forEach((n) => {
        let gridline = line([n, ymin], [n, ymax]);
        gridline.x1 = X(gridline.x1);
        gridline.x2 = gridline.x1;
        gridline.y1 = t;
        gridline.y2 = -t;
        const txt = label(n).textAnchor("middle");
        txt.x = gridline.x1;
        txt.y = gridline.y1 + 10;
        ticks.push(tick(gridline, txt));
      });
    }
    if (this.direction === "y") {
      const yi = Math.floor(ymin);
      const yf = Math.floor(ymax);
      let ys = range(yi, yf + 1, k);
      if (this.hasNo("zero")) {
        ys = ys.filter((n) => n !== 0);
      }
      ys.forEach((n) => {
        let gridline = line([xmin, n], [xmax, n]);
        gridline.x1 = -t;
        gridline.x2 = t;
        gridline.y1 = Y(gridline.y1);
        gridline.y2 = gridline.y1;
        const txt = label(n).textAnchor("end");
        txt.x = gridline.x1 - 2;
        txt.y = gridline.y1 + 2;
        ticks.push(tick(gridline, txt));
      });
    }
    return ticks;
  }

  /** The axis’s placement. */
  orientation: "top" | "left" | "right" | "bottom" = "bottom";

  /**
   * @method
   * Sets the axis’s place. The argument must be one of the
   * following strings: `top`, `left`, `right`, or `bottom`.
   */
  orient(
    orientation: "top" | "left" | "right" | "bottom",
  ) {
    this.orientation = orientation;
    return this;
  }
  tickLabelAnchor?: "start" | "middle" | "end";
  ticksAnchored(on: "start" | "middle" | "end") {
    this.tickLabelAnchor = on;
    return this;
  }
}

export const axis = (of: "x" | "y") => new Axis(of);

export const isAxis = (node: FigNode): node is Axis => (
  !unsafe(node) && node.isType("axis")
);
