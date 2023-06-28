export class Space {
  width: number = 500;
  height: number = 500;
  /**
   * Sets the figure’s physical size/
   */
  size(width: number, height: number) {
    this.width = width;
    this.height = height;
    return this;
  }

  boxed(dimension: "height" | "width") {
    if (dimension === "height") {
      const height = this.height;
      const top = this.marginOf("top");
      const bottom = this.marginOf("bottom");
      return height - top - bottom;
    } else {
      const width = this.width;
      const left = this.marginOf("left");
      const right = this.marginOf("right");
      return width - left - right;
    }
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
