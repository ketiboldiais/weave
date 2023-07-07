import type { And, Cst } from "../index.js";

export type Palette = {
  stroke: string;
  fill: string;
  strokeWidth: string | number;
  strokeDashArray: string | number;
  opacity: number;
};
const palette = (update: Partial<Palette>, prev: Partial<Palette>) => ({
  ...prev,
  ...update,
});

/**
 * An object that can take color
 * styles.
 */
export interface Paletted {
  /**
   * Sets the stroke color.
   */
  stroke(value: string): this;
  /**
   * Sets the fill color.
   */
  fill(value: string): this;
  /**
   * Sets the stroke width.
   */
  weight(value: string | number): this;
  /**
   * Sets the stroke-dash array property.
   */
  dash(value: string | number): this;

  /**
   * Sets the opacity value.
   */
  opacity(value: number): this;

  get strokeColor(): string;
  get strokeWidth(): string;
  get strokeDashArray(): string;
  get opacityValue(): string;
  get fillColor(): string;
}

export const paletted = <T extends Cst>(base: T): And<T, Paletted> => (
  class extends base {
    colors: Partial<Palette> | null = null;

    private add(prop: Partial<Palette>) {
      this.colors = palette(prop, this.colors !== null ? this.colors : {});
      return this;
    }
    private read(prop: keyof Palette) {
      return this.colors === null
        ? ""
        : (this.colors[prop] === undefined ? "" : `${this.colors[prop]}`);
    }

    get strokeColor() {
      return this.read("stroke");
    }
    get strokeWidth() {
      return this.read("strokeWidth");
    }
    get strokeDashArray() {
      return this.read("strokeDashArray");
    }
    get opacityValue() {
      return this.read("opacity");
    }
    get fillColor() {
      return this.read("fill");
    }

    dash(strokeDashArray: string | number) {
      return this.add({ strokeDashArray });
    }
    weight(strokeWidth: string | number) {
      return this.add({ strokeWidth });
    }
    fill(fill: string) {
      return this.add({ fill });
    }
    stroke(stroke: string) {
      return this.add({ stroke });
    }
    opacity(opacity: number) {
      return this.add({ opacity });
    }
  }
);
