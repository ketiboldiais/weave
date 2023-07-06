import { Path } from "../index.js";
import type { N2 } from "../index.js";

export class Figure {
  X: [number, number] = [-5, 5];
  Y: [number, number] = [-5, 5];
  Z: [number, number] = [-5, 5];

  #setDom(of: "X" | "Y" | "Z", interval: N2) {
    this[of] = (interval[0] < interval[1]) ? interval : this[of];
    return this;
  }

  x(x: number, y: number) {
    return this.#setDom("X", [x, y]);
  }
  y(x: number, y: number) {
    return this.#setDom("Y", [x, y]);
  }
  z(x: number, y: number) {
    return this.#setDom("Z", [x, y]);
  }

  children: Path[] = [];

  /**
   * A computed property – the figure’s width with the
   * left and right margins subtracted.
   *
   * @example
   * ~~~ts
   * // top and bottom margins are 30
   * const fig = figure().size(300,300).margin(30,20);
   * fig.vw // 240
   * ~~~
   */
  get vw() {
    const width = this.w;
    const left = this.margins[1];
    const right = this.margins[3];
    return width - left - right;
  }

  /**
   * A computed property – the figure’s height
   * with the top and bottom margins subtracted.
   *
   * @example
   * ~~~ts
   * // left and right margins are 50
   * const fig = figure().size(300,300).margin(10,50);
   * fig.vh // 200
   * ~~~
   */
  get vh() {
    const height = this.h;
    const top = this.margins[0];
    const bottom = this.margins[2];
    return height - top - bottom;
  }

  /** The width of this figure. */
  w: number = 500;

  /** Sets the width of this figure. */
  width(value: number) {
    this.w = value;
    return this;
  }

  /** The height of this figure. */
  h: number = 500;

  /** Sets the height of this figure. */
  height(value: number) {
    this.h = value;
    return this;
  }

  /**
   * Sets the figure’s physical size/
   */
  size(width: number, height: number) {
    this.w = width;
    this.h = height;
    return this;
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
    this.margins = [top, right, bottom, left];
    return this;
  }
}
