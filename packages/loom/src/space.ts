export class Space {
  /** The width of this figure. */
  width: number = 500;

  /** The height of this figure. */
  height: number = 500;

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
    const top = this.marginTop;
    const bottom = this.marginBottom;
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
    const left = this.marginLeft;
    const right = this.marginRight;
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

  get marginY() {
    return this.marginTop + this.marginBottom;
  }

  get marginX() {
    return this.marginLeft + this.marginRight;
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
  get marginTop() {return this.margins[0]};
  get marginRight() {return this.margins[1]};
  get marginBottom() {return this.margins[2]};
  get marginLeft() {return this.margins[3]};
}
