import { FigNode, label, shift, Space, TextNode } from "./index.js";
import { tuple, unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";

export class Axis {
  /**
   * @property
   * Indicates whether this axis runs
   * along the x, y, or z direction.
   */
  readonly direction: "x" | "y" | "z";

  constructor(direction: "x" | "y" | "z") {
    this.direction = direction;
  }

  /**
   * @method
   * Returns true if this axis is
   * of the provided type.
   */
  is(direction: "x" | "y" | "z") {
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
  private space: () => Space = () => new Space();
  scope(space: Space) {
    this.space = () => space;
    return this;
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
    const out = space.scale()().domain(domain).range(range);
    return out;
  }
  xScale() {
    const space = this.space();
    const domain = space.axisDomain("x");
    const range = space.axisRange("x");
    return space.scale()().domain(domain).range(range);
  }
  yScale() {
    const space = this.space();
    const domain = space.axisDomain("y");
    const range = space.axisRange("y");
    return space.scale()().domain(domain).range(range);
  }
  translationXY() {
    const xscale = this.xScale();
    const yscale = this.yScale();
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

  /**
   * Sets the axis tick labels. An optional
   * callback function may be provided to
   * target each tick.
   */
  labelTicks(f?: (tick: TextNode, index: number) => TextNode) {
    const scale = this.scaleFn();
    const n = this.tickCount;
    const isXAxis = this.is("x");
    const ticks = scale.ticks(n).map((value, index) => {
      let txt = label(`${value}`);
      if (isXAxis) {
        txt.cx = scale(value);
        txt.cy = scale(0);
      } else {
        txt.cx = scale(0);
        txt.cy = scale(value);
      }
      if (f) txt = f(txt, index);
      txt.anchor = txt.anchor ? txt.anchor : this.tickLabelAnchor;
      return txt;
    });
    this.TickLabels = ticks;
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

export const axis = (of: "x" | "y" | "z") => {
  const fig = colorable(typed(Axis));
  return new fig(of).typed("axis");
};

export type AxisNode = ReturnType<typeof axis>;
export const isAxis = (node: FigNode): node is AxisNode => {
  if (unsafe(node)) return false;
  return node.type === "axis";
};
