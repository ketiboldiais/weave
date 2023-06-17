import { isNumber, round, safer } from "./aux.js";

export class Vector {
  x: number;
  y: number;
  z: number;
  constructor(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Returns
   */
  theta() {}

  /**
   * Returns the angle between (a) the difference
   * vector of this vector and the provided
   * vector, and (b) the x-axis.
   */
  gamma(other: Vector) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const gamma = Math.atan2(dy, dx);
    return gamma;
  }

  /**
   * Returns a vector where each component is the
   * provided value.
   */
  static from(value: number | number[]) {
    if (Array.isArray(value)) {
      return new Vector(
        safer(value[0], 0),
        safer(value[1], 0),
        safer(value[2], 0),
      );
    }
    return new Vector(value, value, value);
  }

  /**
   * __Mutating method__. Sets every position
   * of this vector to the provided components.
   */
  PLACE(x: number, y: number, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * __Non-mutating method__. Returns
   * a new copy of this vector, magnified
   * by the provided new magnitude.
   */
  magnify(newMagnitude: number) {
    return this.copy().MAGNIFY(newMagnitude);
  }

  /**
   * __Mutating method__. Magnifies this
   * vector.
   */
  MAGNIFY(newMagnitude: number) {
    const mag = this.mag();
    const ratio = newMagnitude / mag;
    return this.MUL(ratio);
  }

  /**
   * Returns the components of this vector
   * within an array.
   */
  array() {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    return [x, y, z] as [number, number, number];
  }

  private binaryOp(
    arg: Vector | number,
    f: (thisVector: number, arg: number) => number,
  ) {
    const other = isNumber(arg) ? Vector.from(arg) : arg;
    const ax = this.x;
    const bx = other.x;
    const x = f(ax, bx);
    this.x = x;

    const ay = this.y;
    const by = other.y;
    const y = f(ay, by);
    this.y = y;

    const az = this.z;
    const bz = other.z;
    const z = f(az, bz);
    this.z = z;

    return this;
  }

  private unaryOp(f: (element: number, index: number) => number) {
    this.x = f(this.x, 0);
    this.y = f(this.y, 1);
    this.z = f(this.z, 2);
    return this;
  }

  /**
   * __NON-MUTATING METHOD__. Returns a
   * a new vector, based on dividing this
   * vector by the provided argument.
   */
  div(arg: Vector | number) {
    return this.copy().DIV(arg);
  }

  /**
   * __MUTATING METHOD__. Divides this
   * vector by the provided argument.
   * Note that vector divison is non-commutative.
   */
  DIV(arg: Vector | number) {
    return this.binaryOp(
      arg,
      (thisVector, arg) => (arg === 0 ? 0 : thisVector / arg),
    );
  }

  /**
   * __Non-mutating method__. Returns a new
   * vector, based on subtracting the provided
   * _from_ this vector.
   */
  sub(arg: Vector | number) {
    return this.copy().SUB(arg);
  }

  /**
   * __MUTATING METHOD__. Subtracts the
   * provided vector _from_ this vector.
   * Bear in mind that vector subtraction
   * is non-commutative.
   */
  SUB(arg: Vector | number) {
    return this.binaryOp(arg, (thisVector, arg) => thisVector - arg);
  }

  /**
   * __Non-mutating Method__. Returns
   * a new vector, based on multiplying
   * this vector by the provided vector.
   */
  mul(arg: Vector | number) {
    return this.copy().MUL(arg);
  }

  /**
   * __MUTATING METHOD__. Multiplies this
   * vector by the provided vector.
   */
  MUL(arg: Vector | number) {
    return this.binaryOp(arg, (thisVector, arg) => thisVector * arg);
  }

  /**
   * __Non-mutating Method__. Returns
   * a new vector, based on adding
   * the provided vector to this vector.
   */
  add(arg: Vector | number) {
    return this.copy().ADD(arg);
  }

  /**
   * __MUTATING METHOD__. Adds the
   * provided vector this vector.
   */
  ADD(arg: Vector | number) {
    return this.binaryOp(arg, (thisVector, arg) => thisVector + arg);
  }

  /**
   * __Non-mutating method__. Returns a new
   * vector whose components are the components
   * of this vector, all non-negative.
   */
  abs() {
    return this.copy().ABS();
  }

  /**
   * __MUTATING METHOD__. Sets each
   * component of this vector to its
   * absolute value. In practice, equivalent
   * to ensuring every component is non-negative.
   */
  ABS() {
    return this.unaryOp((e) => (e === 0 ? 0 : Math.abs(e)));
  }

  /**
   * __Non-mutating Method__. Returns a new
   * vector, where each component is this
   * vector’s component, negated.
   */
  neg() {
    return this.copy().NEG();
  }

  /**
   * __MUTATING METHOD__. Negates every component
   * of this vector.
   */
  NEG() {
    return this.unaryOp((e) => (e === 0 ? 0 : -e));
  }

  /**
   * __Non-mutating method__. Returns a new
   * zero vector.
   */
  zero() {
    return new Vector(0, 0, 0);
  }

  /**
   * __MUTATING METHOD__. Zeroes this vector.
   * I.e., sets every component to zero.
   */
  ZERO() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
  }

  /**
   * Returns true if this vector
   * equals the provided vector.
   */
  equals(that: Vector) {
    return this.x === that.x && this.y === that.y && this.z === that.z;
  }

  /**
   * An alias for {@link Vector.mag}.
   */
  get length() {
    return this.mag();
  }

  /**
   * Returns the magnitude of this vector.
   * @param precision - An optional precision value
   * may be passed roundingthe magnitude to a specified
   * number of decimal places.
   */
  mag(precision?: number) {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const xyz = (x * x) + (y * y) + (z * z);
    let out = Math.sqrt(xyz);
    if (precision !== undefined) {
      out = round(out, precision);
    }
    return out;
  }

  /**
   * Returns true if this vector
   * is the zero vector.
   */
  isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
  }

  /**
   * __Non-mutating method__. Returns
   * a new vector corresponding to this
   * vector’s normal.
   */
  normal() {
    return this.copy().NORMAL();
  }

  /**
   * __Mutating Method__. Sets this
   * vector to its normal
   */
  NORMAL() {
    if (this.isZero()) return this;
    return this.DIV(this.mag());
  }

  /**
   * Returns the dot product of
   * this vector and the provided
   * vector.
   */
  dot(other: Vector) {
    const x = other.x * this.x;
    const y = other.y * this.y;
    const z = other.z * this.z;
    return (x + y + z);
  }

  /**
   * Returns the distance between this
   * vector and the provided vector.
   */
  distance(other: Vector) {
    const x = other.x - this.x;
    const y = other.y - this.y;
    const z = other.z - this.z;
    const xyz = (x * x) + (y * y) + (z * z);
    return Math.sqrt(xyz);
  }

  /**
   * Returns a copy of this vector.
   */
  copy() {
    return new Vector(this.x, this.y, this.z);
  }
}

export const vector = (
  x: number,
  y: number = x,
  z: number = 0,
) => new Vector(x, y, z);

export const magnitude = (v: Vector) => {
};
