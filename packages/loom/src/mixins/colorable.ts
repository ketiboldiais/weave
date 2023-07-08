import { safer } from "../aux.js";
import { And, Axiom, Color } from "../index.js";

export type Palette = {
  stroke: string;
  fill: string;
  strokeWidth: string | number;
  strokeDashArray: string | number;
  opacity: string | number;
};

export interface Colorable {
  locked: boolean;

  colors: Partial<Palette> | null;

  /**
   * If called, prevents all parent
   * nodes from setting the styles
   * of this colorable.
   */
  lock(): this;

  /**
   * The renderable node’s stroke color.
   */
  get strokeColor(): string;

  /**
   * Sets the renderable node’s stroke color.
   */
  stroke(color: string | Color): this;

  /**
   * The renderable node’s fill color.
   */
  get fillColor(): string;

  /**
   * Sets the renderable node’s fill color.
   */
  fill(color: string | Color): this;

  /**
   * The renderable node’s dash property.
   * If 0, a solid line is shown.
   */
  get strokeDashArray(): string | number;

  /**
   * The renderable node’s opacity, a number
   * between 0 and 1. Values tending towards 0
   * appear more transparent, and values tending
   * towards 1 less transparent.
   */
  get opacityValue(): number | string;

  /**
   * The renderable node’s stroke width
   * (how thick the node’s outline is).
   */
  get strokeWidth(): string | number;

  /**
   * Sets the renderable node’s stroke width.
   */
  weight(value: number): this;

  /**
   * Sets the renderable node’s dash property.
   */
  dash(value: number): this;

  /**
   * Sets the renderable node’s opacity.
   */
  opacity(value: number): this;
  copyColors(node: Colorable): this;
}

export function colorable<NodeClass extends Axiom>(
  nodetype: NodeClass,
): And<NodeClass, Colorable> {
  return class extends nodetype {
    locked: boolean = false;
    colors: Partial<Palette> | null = null;
    lock() {
      this.locked = true;
      return this;
    }
    private enstyle(palette: Partial<Palette>) {
      const colors = this.colors;
      if (colors === null) {
        this.colors = palette;
      } else {
        this.colors = { ...colors, ...palette };
      }
    }
    copyColors(node: Colorable) {
      if (!this.locked) {
        const colors = node.colors;
        this.colors = { ...colors };
      }
      return this;
    }
    // opacityValue?: number;
    opacity(opacity: number) {
      this.enstyle({ opacity });
      // this.opacityValue = value;
      return this;
    }
    get fillColor() {
      return this.colors ? safer(this.colors.fill, "") : "";
    }
    get strokeColor() {
      return this.colors ? (this.colors.stroke || "") : "";
    }
    get strokeWidth() {
      return this.colors ? safer(this.colors.strokeWidth, 1) : 1;
    }
    get strokeDashArray() {
      return this.colors ? safer(this.colors.strokeDashArray, 0) : 0;
    }
    get opacityValue() {
      return this.colors ? safer(this.colors.opacity, "") : "";
    }
    stroke(stroke: string | Color): this {
      this.enstyle(
        typeof stroke === "string" ? ({ stroke }) : ({ stroke: stroke.color }),
      );
      return this;
    }

    fill(fill: string | Color): this {
      this.enstyle(
        typeof fill === "string" ? ({ fill }) : ({ fill: fill.color }),
      );
      return this;
    }

    weight(strokeWidth: number): this {
      this.enstyle({ strokeWidth });
      return this;
    }

    dash(strokeDashArray: number): this {
      this.enstyle({ strokeDashArray });
      return this;
    }
  };
}
