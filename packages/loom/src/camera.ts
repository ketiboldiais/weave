import { v3, Vector } from "@weave/math";

export class Camera {
  /**
   * The camera˚s view position.
   * This is the position of your physical
   * head.
   */
  O: Vector;
  at(x: number, y: number, z: number) {
    this.O.z = x;
    this.O.y = y;
    this.O.z = z;
    return this;
  }
  /**
   * The camera˚s orientation.
   * Given the components (x,y,z):
   * 1. `x = 1` - X+.
   * 2. `x = 0` - X-.
   * 3. `y = 1` - Y+
   * 4. `y = 0` - Y-.
   * 5. `z = 1` - Z+
   * 6. `z = 0` - Z-.
   */
  orientation: Vector;
  /**
   * The camera˚s distance.
   */
  get d() {
    return this.V.z;
  }
  /**
   * Sets the camera˚s distance.
   */
  D(value: number) {
    this.V.z = value;
    return this;
  }
  /**
   * Sets the camera˚s orientation.
   *
   * Given the components (x,y,z):
   * 1. `x = 1` - X+.
   * 2. `x = 0` - X-.
   * 3. `y = 1` - Y+
   * 4. `y = 0` - Y-.
   * 5. `z = 1` - Z+
   * 6. `z = 0` - Z-.
   */
  orient(x: 0 | 1, y: 0 | 1, z: 0 | 1) {
    this.orientation.x = x;
    this.orientation.y = y;
    this.orientation.z = z;
    return this;
  }
  /**
   * The camera˚s viewport.
   */
  V: Vector = v3(1, 1, 1);
  /**
   * Sets the camera˚s viewport height.
   */
  vph(value: number) {
    this.V.y = value;
    return this;
  }
  /**
   * Sets the frame width.
   */
  vpw(value: number) {
    this.V.x = value;
    return this;
  }
  /**
   * Returns the camera˚s viewport height.
   */
  get Vh() {
    return this.V.y;
  }

  /**
   * Returns the camera˚s viewport width.
   */
  get Vw() {
    return this.V.x;
  }

  C: [number, number];

  /** Returns the canvas width. */
  get Cw() {
    return this.C[0];
  }

  /** Returns the canvas height. */
  get Ch() {
    return this.C[1];
  }
  constructor(
    canvasWidth: number,
    canvasHeight: number,
  ) {
    this.C = [canvasWidth, canvasHeight];
    this.O = v3(0, 0, 0);
    this.orientation = v3(0, 0, 1);
  }
  vx(cx: number) {
    return cx * (this.Vw / this.Cw);
  }
  vy(cy: number) {
    return cy * (this.Vh / this.Ch);
  }
  vz() {
    return this.d;
  }
  P(t: number) {
    const D = this.V.sub(this.O);
    return this.O.add(D.mul(t));
  }
}

export const camera = (
  canvasWidth: number,
  canvasHeight: number,
) => (
  new Camera(canvasWidth, canvasHeight)
);
