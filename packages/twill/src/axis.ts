import {
  Circle,
  circle,
  FigNode,
  label,
  Line,
  line,
  linear,
  shift,
  TextNode,
} from "./index.js";
import { round, toFrac, tuple, unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";
import { scopable } from "./scopable.js";
import { Base } from "./base.js";

const AXIS_BASE = scopable(typed(colorable(Base)));

export class PolarAxis extends AXIS_BASE {
  tickCount: number;
  constructor() {
    super();
    this.type = "polar-axis";
    this.tickCount = 5;
  }
  

  /**
   * Sets the number of ticks
   * along this axis.
   */
  ticks(value: number) {
    this.tickCount = value;
    return this;
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
      circle(xs(r)).xy(xs(0), ys(0)),
    ];
    return out;
  }
  hiddens: Set<string> = new Set();
  hide(option: "ticks" | "zero" | "axis-line") {
    this.hiddens.add(option);
    return this;
  }
  hasNo(option: "ticks" | "zero" | "axis-line") {
    return this.hiddens.has(option);
  }
  /**
   * Returns an array of the radial
   * lines comprising the polar axis’s
   * ticks.
   */
  axisTicks(): Line[] {
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
}

export const isPolarAxis = (node: FigNode): node is PolarAxis => (
  !unsafe(node) && node.isType("polar-axis")
);

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
    const width = space.boxed("width");
    const height = space.boxed("height");
    const range = this.is("x") ? tuple(0, width) : tuple(height, 0);
    return range;
  }
  scaleFn() {
    const space = this.space();
    const domain = this.domain();
    const range = this.range();
    const scale = space.scale();
    const out = scale(domain, range);
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

  tickCount: number = 5;

  /**
   * Sets the number of ticks
   * along this axis.
   */
  ticks(value: number) {
    this.tickCount = value;
    return this;
  }

  TickLength: number = 3;

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

  /**
   * Sets the axis tick labels. An optional
   * callback function may be provided to
   * target each tick.
   */
  labelTicks(f?: (tick: TextNode, index: number) => TextNode) {
    const space = this.space();
    const scale = this.scaleFn();
    const n = this.tickCount;
    const isXAxis = this.is("x");
    this.TickLabels = [];
    const ran = isXAxis ? space.X : space.Y;
    const rescale = linear([0, n - 1], [ran.x, ran.y]);
    for (let i = 0; i < n; i++) {
      const value = rescale(i);

      let x = value.toPrecision(this.tickPrecision);
      if (Number.isInteger(value)) {
        x = `${value}`;
      } else if (this.tickFormat === "Q") {
        const [a, b] = toFrac(value);
        x = `${a}/${b}`;
      }
      let txt = label(x);
      if (isXAxis) {
        txt.x = scale(value);
        txt.y = scale(0);
      } else {
        txt.x = scale(0);
        txt.y = scale(value);
      }
      if (f) txt = f(txt, i);
      txt.anchor = txt.anchor
        ? txt.anchor
        : (this.tickLabelAnchor ? this.tickLabelAnchor : (
          this.is("x") ? "middle" : "end"
        ));
      if (x === "0" && this.hasNo("zero")) {
        continue;
      }
      this.TickLabels.push(txt);
    }
    return this;
  }

  /**
   * Returns an array of tick
   * objects.
   */
  axisTicks(): TextNode[] {
    if (this.TickLabels.length !== 0) return this.TickLabels;
    this.labelTicks();
    return this.TickLabels;
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

export const axis = (of: "x" | "y" | "polar") => {
  if (of === "polar") return new PolarAxis();
  return new Axis(of);
};

export const isAxis = (node: FigNode): node is Axis => {
  if (unsafe(node)) return false;
  return node.type === "axis";
};
