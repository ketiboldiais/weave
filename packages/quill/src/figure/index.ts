import { Path } from "../index.js";
import type { N2 } from "../index.js";

export class Figure {
  X: [number, number] = [-5, 5];

  children: Path[];
  constructor(children: Path[]) {
    this.children = [];
  }

  /**
   * Returns the minimum x-coordinate of this
   * figure.
   */
  get xmin() {
    return this.X[0];
  }
  /**
   * Returns the maximum x-coordinate of this
   * figure.
   */
  get xmax() {
    return this.X[1];
  }

  Y: [number, number] = [-5, 5];

  /**
   * Returns the minimum y-coordinate of this
   * figure.
   */
  get ymin() {
    return this.Y[0];
  }
  /**
   * Returns the maximum y-coordinate of
   * this figure.
   */
  get ymax() {
    return this.Y[1];
  }

  /**
   * Returns the smallest z-coordinate
   * of this figure.
   */
  get zmin() {
    return this.Z[0];
  }
  /**
   * Returns the largest z-coordinate of this
   * figure.
   */
  get zmax() {
    return this.Z[1];
  }

  Z: [number, number] = [-5, 5];

  private setDom(of: "X" | "Y" | "Z", interval: N2) {
    this[of] = (interval[0] < interval[1]) ? interval : this[of];
    return this;
  }

  /**
   * Sets the x-domain of this figure.
   */
  x(x: number, y: number) {
    return this.setDom("X", [x, y]);
  }
  /**
   * Sets the y-domain of this figure.
   */
  y(x: number, y: number) {
    return this.setDom("Y", [x, y]);
  }
  /**
   * Sets the z-domain of this figure.
   */
  z(x: number, y: number) {
    return this.setDom("Z", [x, y]);
  }

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
   * Returns the top margin value.
   */
  get marginTop() {
    return this.margins[0];
  }

  /**
   * Returns the right margin value.
   */
  get marginRight() {
    return this.margins[1];
  }

  /**
   * Returns the bottom margin value.
   */
  get marginBottom() {
    return this.margins[2];
  }

  /**
   * Returns the left margin value.
   */
  get marginLeft() {
    return this.margins[3];
  }

  /**
   * Returns the sum of the left and right
   * margins.
   */
  get marginX() {
    return this.margins[1] + this.margins[3];
  }

  /**
   * Returns the sum of the top and bottom
   * margins.
   */
  get marginY() {
    return this.margins[0] + this.margins[2];
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

export const figure = (children: Path[]) => (
  new Figure(children)
);
