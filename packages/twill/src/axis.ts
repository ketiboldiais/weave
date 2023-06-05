import { FigNode, label, Space, TextNode } from ".";
import { tuple } from "./aux";
import { colorable } from "./colorable";
import { typed } from "./typed";

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

  tickCount: number = 5;

  /**
   * Sets the number of ticks
   * along this axis.
   */
  ticks(value: number) {
    this.tickCount = value;
    return this;
  }

  TickLength: number = 6;
  
  tickLength(value: number) {
    this.TickLength = value;
    return this;
  }

  /**
   * Returns an array of tick
   * objects.
   */
  axisTicks(f?: (tick: TextNode) => TextNode): TextNode[] {
    const scale = this.scaleFn();
    const n = this.tickCount;
    const ticks = scale.ticks(n).map((value) => {
      let txt = label(`${value}`);
      if (this.is("x")) {
        txt.x = scale(value);
        txt.y = scale(0);
      } else {
        txt.x = scale(0);
        txt.y = scale(value);
      }
      if (f) txt = f(txt);
      return txt;
    });
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
}

export const axis = (of: "x" | "y" | "z") => {
  const fig = colorable(typed(Axis));
  return new fig(of).typed("axis");
};

export type AxisNode = ReturnType<typeof axis>;
export const isAxis = (node: FigNode): node is AxisNode => (
  node.type === "axis"
);
