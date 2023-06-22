import { Angle, AngleUnit } from "./angle.js";
import { isNumber, round, safer } from "./aux.js";
import { ray } from "./line.js";
import { Matrix, matrix } from "./matrix.js";

export class Vector {
  elements: number[];
  constructor(elements: number[]) {
    this.elements = elements;
  }

  /**
   * Returns a string RGB color based on
   * this vector. An optional callback function
   * may be passed to scale the resulting values.
   */
  rgb(callback?: (r: number, g: number, b: number) => Vector) {
    const base = 255.999;
    const r = this.x * base;
    const g = this.y * base;
    const b = this.z * base;
    if (callback) {
      const v = callback(r, g, b);
      const R = v.x;
      const G = v.y;
      const B = v.z;
      return `rgb(${R},${G},${B})`;
    }
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Returns the order of this vector.
   * I.e., the number of components in this
   * vector.
   */
  get order() {
    return this.elements.length;
  }
  get x() {
    return this.elements[0] !== undefined ? this.elements[0] : 0;
  }

  set x(value: number) {
    this.elements[0] = value;
  }

  get y() {
    return this.elements[1] !== undefined ? this.elements[1] : 0;
  }

  set y(value: number) {
    this.elements[1] = value;
  }

  get z() {
    return this.elements[2] !== undefined ? this.elements[2] : 0;
  }

  set z(value: number) {
    this.elements[2] = value;
  }

  /**
   * Returns this vector as a renderable
   * ray. The ray’s starting coordiantes
   * may be passed. By default, these
   * coordinates are set to `(0,0)`.
   */
  ray2(origin: Vector | number[] = [0, 0]) {
    const start = Vector.from(origin);
    const end = new Vector([this.x, this.y]);
    return ray(start, end);
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
   * __Mutating method__. Sets this vector’s
   * 3D position.
   */
  xyz(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  /**
   * __Mutating method__. Sets this vector’s
   * 2D position.
   */
  xy(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.z = 0;
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
    return this.elements.map((e) => e);
  }

  /**
   * Returns the ith vector component. Following
   * mathematical conventions, indices start at 1.
   */
  n(i: number) {
    return this.elements[i - 1] !== undefined ? this.elements[i - 1] : 0;
  }
  /**
   * Sets the ith vector component. Following
   * mathematical conventions, indices start
   * at 1.
   */
  set(i: number, value: number) {
    if (this.elements[i - 1]!==undefined) {
      this.elements[i - 1] = value;
    }
    return this;
  }

  private binaryOp(
    arg: Vector | number,
    f: (thisVector: number, arg: number) => number,
  ) {
    const other = typeof arg === 'number'
      ? Vector.from(new Array(this.elements.length).fill(arg))
      : arg;
    for (let i = 1; i <= this.order; i++) {
      const a = this.n(i);
      const b = other.n(i);
      const c = f(a, b);
      this.elements[i-1]=c;
    }
    return this;
  }

  private unaryOp(f: (element: number) => number) {
    for (let i = 1; i <= this.order; i++) {
      const a = f(this.n(i));
      this.set(i, a);
    }
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
   * Returns the vector-matrix product of
   * this vector and the provided matrix (
   * the dot product this vector and each
   * row in the matrix). If the number
   * of columns in the provided matrix 
   * is not equal to the order of this
   * vector, return this vector.
   */
  vxm(matrix: Matrix) {
    if (this.order !== matrix.C) return this;
    const vector = new Vector([]);
    for (let i = 1; i <= matrix.R; i++) {
      const v = matrix.row(i);
      const d = this.dot(v);
      vector.elements[i - 1] = d;
    }
    return vector;
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
    return this.copy().ZERO();
  }

  /**
   * __MUTATING METHOD__. Zeroes this vector.
   * I.e., sets every component to zero.
   */
  ZERO() {
    for (let i = 0; i < this.elements.length; i++) {
      this.elements[i] = 0;
    }
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
   *
   * In this library, the normal is equivalent
   * to the unit vector (i.e., which direction
   * this vector is pointing in).
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
    const order = this.order;
    if (other.order !== order) return 0;
    let sum = 0;
    for (let i = 0; i < order; i++) {
      const a = this.elements[i];
      const b = other.elements[i];
      const p = a * b;
      sum += p;
    }
    return sum;
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
   * vector in-place. The cross
   * product is used primarily to
   * compute the vector perpendicular
   * to two vectors.
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
   * Returns the 2D distance between this
   * vector and the provided vector.
   */
  d3(other: Vector) {
    const x = other.x - this.x;
    const y = other.y - this.y;
    const xyz = (x * x) + (y * y);
    return Math.sqrt(xyz);
  }

  /**
   * Returns the 3D distance between this
   * vector and the provided vector.
   */
  d2(other: Vector) {
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
    return new Vector(this.array());
  }
  /**
   * Returns a new zero vector of the specified
   * length.
   */
  static zero(length: number) {
    return new Vector(new Array(length).fill(0));
  }

  /**
   * Returns a new vector of order L,
   * filled with the given value.
   */
  static fill(L: number, value: number) {
    return new Vector(new Array(L).fill(value));
  }

  /**
   * Returns a vector where each component is the
   * provided value.
   */
  static from(value: number[] | Vector) {
    if (Array.isArray(value)) {
      return new Vector(value);
    } else {
      return new Vector(value.elements);
    }
  }
  /**
   * Given an array of vectors, returns
   * the vector of the largest {@link Vector.order}.
   */
  static maxOrder(vectors: Vector[]) {
    let max = 0;
    for (let i = 0; i < vectors.length; i++) {
      const L = vectors[i].order;
      if (L > max) max = L;
    }
    return max;
  }
}

/**
 * Returns the distance between the
 * two provided vectors.
 */
export const distance3D = (
  vector1: Vector | number[],
  vector2: Vector | number[],
) => (
  (Vector.from(vector1)).d3(Vector.from(vector2))
);

/**
 * Returns the distance between the
 * two provided vectors.
 */
export const distance2D = (
  vector1: Vector | number[],
  vector2: Vector | number[],
) => (
  (Vector.from(vector1)).d2(Vector.from(vector2))
);

/**
 * Returns a new 2D vector.
 */
export const v2 = (
  x: number,
  y: number = x,
) => new Vector([x, y]);

/**
 * Returns a new 3D vector.
 */
export const v3 = (
  x: number,
  y: number = x,
  z: number = 1,
) => new Vector([x, y, z]);

/**
 * Returns a new generic vector.
 */
export const vector = (...coords: number[]) => new Vector(coords);

export const cross = (
  a: Vector | number[],
  b: Vector | number[],
  origin: Vector | number[] = [0, 0, 0],
) => {
  const A = Vector.from(a);
  const B = Vector.from(b);
  const O = Vector.from(origin);
  const r_A = A.ray2(O);
  const r_B = B.ray2(O);
  const r_AB = A.cross(B).ray2(O);
  return [r_A, r_B, r_AB];
};
