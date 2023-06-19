import { FigNode, label, shift, Space, tex, TextNode } from "./index.js";
import { toFrac, tuple, unsafe } from "./aux.js";
import { colorable } from "./colorable.js";
import { typed } from "./typed.js";
import {scopable} from './scopable.js';
import {Base} from './base.js';

const AXIS_BASE = scopable(typed(colorable(Base)));

export class Axis extends AXIS_BASE {
  /**
   * @property
   * Indicates whether this axis runs
   * along the x, y, or z direction.
   */
  readonly direction: "x" | "y" | "z";
  
  tickFormat: 'F'|'Q' = 'Q'

  constructor(direction: "x" | "y" | "z") {
    super();
    this.type = 'axis';
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
    const scale = space.scale()
    const out = scale(domain, range);
    return out;
  }
  xScale() {
    const space = this.space();
    const domain = space.axisDomain("x");
    const range = space.axisRange("x");
    const scale = space.scale();
    return scale(domain, range);
  }
  yScale() {
    const space = this.space();
    const domain = space.axisDomain("y");
    const range = space.axisRange("y");
    const scale = space.scale();
    return scale(domain, range);
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
      let x = `${value}`
      if (!Number.isInteger(value)) {
        const [a,b] = toFrac(value);
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
  return new Axis(of);
};

export const isAxis = (node: FigNode): node is Axis => {
  if (unsafe(node)) return false;
  return node.type === "axis";
};
