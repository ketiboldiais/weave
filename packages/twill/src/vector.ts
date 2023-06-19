import {Angle, AngleUnit} from './angle.js';
import { isNumber, round, safer } from "./aux.js";
import { ray } from "./line.js";

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
   * Returns this vector as a renderable
   * ray. The ray’s starting coordiantes
   * may be passed. By default, these
   * coordinates are set to `(0,0)`.
   */
  ray(origin: Vector | number[]=[0,0,0]) {
    const start = Vector.from(origin);
    const end = new Vector(this.x, this.y);
    return ray(start, end);
  }
  
  toCart(radius:number, angle:Angle|[number,AngleUnit]) {
    const a = Angle.from(angle).toRadians()
    const radians = a.value;
    const cx = a.cx;
    const cy = a.cy;
    const x = (cx) + (radius * Math.cos(radians));
    const y = (cy) + (radius * Math.sin(radians));
    return vector(x,y);
  }

  /**
   * Returns the angle between the two
   * provided vectors.
   */
  theta(other: Vector) {
    const ab = this.dot(other);
    const mag = this.mag();
    const factor = ab / (mag);
    return Math.acos(factor);
  }

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
  static from(value: number | number[] | Vector) {
    if (Array.isArray(value)) {
      return new Vector(
        safer(value[0], 0),
        safer(value[1], 0),
        safer(value[2], 0),
      );
    } else if (value instanceof Vector) {
      return new Vector(value.x, value.y, value.z);
    } else return new Vector(value, value, value);
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
   * __Non-mutating Method__. Returns
   * the cross product of this
   * vector against the provided
   * vector as a new vector.
   */
  cross(other: Vector) {
    return this.copy().CROSS(other);
  }

  /**
   * __Mutating Method__. Returns
   * the cross product of this
   * vector in-place.
   */
  CROSS(other: Vector) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const bx = other.x;
    const by = other.y;
    const bz = other.z;
    const cx = (ay * bz) - (az * by);
    const cy = (az * bx) - (ax * bz);
    const cz = (ax * by) - (ay * bx);
    this.x = cx;
    this.y = cy;
    this.z = cz;
    return this;
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

/**
 * Returns the distance between the
 * two provided vectors.
 */
export const distance = (
  vector1: Vector | number[],
  vector2: Vector | number[],
) => (
  (Vector.from(vector1)).distance(Vector.from(vector2))
);

export const vector = (
  x: number,
  y: number = x,
  z: number = 0,
) => new Vector(x, y, z);

export const cross = (
  a: Vector | number[],
  b: Vector | number[],
  origin: Vector | number[] = [0, 0, 0],
) => {
  const A = Vector.from(a);
  const B = Vector.from(b);
  const O = Vector.from(origin);
  const r_A = A.ray(O);
  const r_B = B.ray(O);
  const r_AB = A.cross(B).ray(O);
  return [r_A, r_B, r_AB];
};
