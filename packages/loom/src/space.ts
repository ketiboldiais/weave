export class Space {
  /**
   * Sets the figure’s physical size/
   */
  size(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }
  /**
   * Returns this figure’s computed
   * viewport area.
   */
  get va() {
    const width = this.vw;
    const height = this.vh;
    return width * height;
  }

  /** The width of this figure. */
  width: number = 500;

  /** Sets the width of this figure. */
  w(value: number) {
    this.width = value;
    return this;
  }

  /** The height of this figure. */
  height: number = 500;

  /** Sets the height of this figure. */
  h(value: number) {
    this.height = value;
    return this;
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
    const height = this.height;
    const top = this.marginOf("top");
    const bottom = this.marginOf("bottom");
    return height - top - bottom;
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
    const width = this.width;
    const left = this.marginOf("left");
    const right = this.marginOf("right");
    return width - left - right;
  }

  /**
   * Sets the figure’s margins specifically.
   * This method expects the first argument to be one of:
   *
   * - `'top'`
   * - `'right'`
   * - `'bottom'`
   * - `'left'`
   *
   * and the second argument to be a number.
   *
   * @example
   * ~~~
   * figure()
   *   .m('top', 10); // top margin is 10px
   *   .m('right', 20); // top margin is 20px
   *   .m('bottom', 5); // bottom margin is 5px
   *   .m('left', 10); // left margin is 10px
   * ~~~
   */
  m(of: "top" | "right" | "bottom" | "left", value: number) {
    // deno-fmt-ignore
    switch (of) {
       case 'top': this.margins[0] = value; break;
       case 'right': this.margins[1] = value; break;
       case 'bottom': this.margins[2] = value; break;
       case 'left': this.margins[3] = value; break;
     }
    return this;
  }

  marginY() {
    return this.marginOf("top") + this.marginOf("bottom");
  }

  marginX() {
    return this.marginOf("left") + this.marginOf("right");
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
    this.margins[0] = top;
    this.margins[1] = right;
    this.margins[2] = bottom;
    this.margins[3] = left;
    return this;
  }
  marginOf(order: "top" | "right" | "bottom" | "left") {
    switch (order) {
      case "top":
        return this.margins[0];
      case "right":
        return this.margins[1];
      case "bottom":
        return this.margins[2];
      case "left":
        return this.margins[3];
      default:
        return 50;
    }
  }
}
