import {
  Circle,
  circle,
  FigNode,
  label,
  Line,
  line,
  shift,
  TextNode,
} from "./index.js";
import { tuple, unsafe } from "./aux.js";
import { colorable } from "./mixins/colorable.js";
import { typed } from "./mixins/typed.js";
import { scopable } from "./mixins/scopable.js";
import { Base } from "./base.js";
import { interpolator } from "@weave/math";

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
  readonly direction: "x" | "y" | "polar";
  tickFormat: "F" | "Q" = "F";

  constructor(direction: "x" | "y" | "polar") {
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
   * Returns the polar plot’s
   * cicular axes, an array of
   * circles.
   */
  radialAxes(): Circle[] {
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const d = 2;
    const rx = xs(space.amplitude("x") / d) / 2;
    const ry = ys(space.amplitude("y") / d) / 2;
    const r = Math.min(rx, ry);
    const out: Circle[] = [
      circle(xs(r)).at(xs(0), ys(0)),
    ];
    return out;
  }
  /**
   * Returns an array of the radial
   * lines comprising the polar axis’s
   * ticks.
   */
  polarAxisTicks() {
    const ticks: Line[] = [];
    const space = this.space();
    const xs = space.scaleOf("x");
    const ys = space.scaleOf("y");
    const d = 2;
    const rx = space.amplitude("x") / d;
    const ry = space.amplitude("y") / d;
    const cx = xs(0);
    const cy = ys(0);
    const ub = 2 * Math.PI;
    const inc = Math.PI / 4;
    for (let i = 0; i < ub; i += inc) {
      const x1 = rx * Math.cos(i);
      const y1 = ry * Math.sin(i);
      const axisLine = line([xs(x1), ys(y1)], [cx, cy]);
      axisLine.copyColors(this);
      ticks.push(axisLine);
    }
    return ticks;
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
      ? tuple(space.xmin(), space.xmax())
      : tuple(space.ymin(), space.ymax());
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
    const xscale = space.scaleOf("x");
    const yscale = space.scaleOf("y");
    if (this.is("y")) {
      return shift(xscale(0), 0);
    } else {
      return shift(0, yscale(0));
    }
  }

  tickCount?: number;

  /**
   * Sets the number of ticks
   * along this axis.
   */
  ticks(value: number) {
    this.tickCount = value;
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
    const xmin = space.xmin();
    const xmax = space.xmax();
    const ymin = space.ymin();
    const ymax = space.ymax();
    const X = space.scaleOf("x");
    const Y = space.scaleOf("y");
    const ticks: TickData[] = [];
    const t = this.TickLength;
    if (this.direction === "x") {
      const xi = Math.floor(xmin);
      const xf = Math.floor(xmax);
      for (let i = xi; i <= xf; i++) {
        let gridline = line([i, ymin], [i, ymax]);
        gridline.x1 = X(gridline.x1);
        gridline.x2 = gridline.x1;
        gridline.y1 = t;
        gridline.y2 = -t;
        const txt = label(i).textAnchor("middle");
        txt.x = gridline.x1;
        txt.y = gridline.y1 + 10;
        ticks.push(tick(gridline, txt));
      }
    }
    if (this.direction === "y") {
      const yi = Math.floor(ymin);
      const yf = Math.floor(ymax);
      for (let j = yi; j <= yf; j++) {
        let gridline = line([xmin, j], [xmax, j]);
        gridline.x1 = -t;
        gridline.x2 = t;
        gridline.y1 = Y(gridline.y1);
        gridline.y2 = gridline.y1;
        const txt = label(j).textAnchor('end');
        txt.x = gridline.x1 - 2;
        txt.y = gridline.y1 + 2;
        ticks.push(tick(gridline, txt));
      }
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

export const axis = (of: "x" | "y" | "polar") => new Axis(of);

export const isAxis = (node: FigNode): node is Axis => (
  !unsafe(node) && node.isType("axis")
);
