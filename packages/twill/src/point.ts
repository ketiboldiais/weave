export class Point {
  name: string;
  /** The point’s x-coordinate. */
  cx: number = -1;
  /** The point’s y-coordinate. */
  cy: number = 0;
  /** The amount of x-space taken up by this point. */
  sx: number = 5;
  /** The amount of y-space taken up by this point. */
  sy: number = 5;
  /** The amount of offset applied to the x-coordinate. */
  dx: number = 0;
  /** The amount of offset applied to the y-coordinate. */
  dy: number = 0;
  constructor(name: string = "") {
    this.name = name;
  }
  /**
   * Sets the point’s dx value.
   */
  Dy(value:number) {
    this.dy=value;
    return this;
  }
  /**
   * Sets the point’s dy value.
   */
  Dx(value:number) {
    this.dx=value;
    return this;
  }
	/** Sets the y-coordinate of this point. */
  y(y: number) {
    this.cy = y;
    return this;
  }
	/** Sets the x-coordinate of this point. */
  x(x: number) {
    this.cx = x;
    return this;
  }
}
export class RadialPoint extends Point {
  r: number = 5;
  constructor(name: string) {
    super(name);
  }
  radius(value: number) {
    this.r = value;
    return this;
  }
}
