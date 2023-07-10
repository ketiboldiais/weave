import { randFloat, randInt, round } from "./index.js";
import { Matrix } from "./matrix.js";

export class Vector {
  elements: number[];
  constructor(elements: number[]) {
    this.elements = elements;
  }

  /**
   * Returns the smallest component
   * of this vector.
   */
  get min() {
    let min = Infinity;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (elem < min) {
        min = elem;
      }
    }
    return min;
  }

  /**
   * Returns this vector as a matrix.
   */
  matrix() {
    const elements = this.elements.map((n) => new Vector([n]));
    return new Matrix(elements.length, 1, elements);
  }

  /**
   * Returns the largest component
   * of this vector.
   */
  get max() {
    let max = -Infinity;
    for (let i = 0; i < this.elements.length; i++) {
      const elem = this.elements[i];
      if (elem > max) {
        max = elem;
      }
    }
    return max;
  }

  /**
   * Returns the string representation of this vector.
   */
  toString() {
    let out = "⟨";
    out += this.elements.map((d) => `${d}`).join(",") + "⟩";
    return out;
  }

  /**
   * Returns the unit vector
   * point from this vector 𝑢
   * to the provided 𝑣.
   */
  normalTo(v: Vector) {
    const d = this.sub(v);
    return d.normalize();
  }

  /**
   * __Non-mutating method__. Squares each component
   * of a copy of this vector.
   */
  square() {
    return this.copy().SQUARE();
  }

  /**
   * __MUTATING METHOD__. Squares every component of this vector.
   */
  SQUARE() {
    return this.MUL(this);
  }

  /**
   * __Non-mutating Method__. Raises every
   * component of a copy of this vector to
   * the provided component.
   */
  pow(arg: Vector | number | number[]) {
    return this.copy().POW(arg);
  }

  /**
   * __MUTATING METHOD__. Raises every component to the provided
   * vector.
   */
  POW(arg: Vector | number | number[]) {
    return this.binaryOp(arg, (a, b) => a ** b);
  }

  /**
   * Returns the order of this vector.
   * I.e., the number of components in this
   * vector.
   */
  get order() {
    return this.elements.length;
  }

  /**
   * Returns a copy of this vector, ensured as 2D.
   *
   * @param x - The fallback x-component if the current x-component
   * is undefined.
   * @param y - The fallback y-component if the current y-component
   * is undefined.
   */
  v2D(x: number = 0, y: number = 0) {
    return new Vector([
      this.elements[0] !== undefined ? this.elements[0] : x,
      this.elements[1] !== undefined ? this.elements[1] : y,
    ]);
  }

  /**
   * Returns a copy of this vector, ensured as 3D.
   *
   * @param x - The fallback x-component if the current x-component
   * is undefined.
   * @param y - The fallback y-component if the current y-component
   * is undefined.
   * @param z - The fallback z-component if the current z-component
   * is undefined.
   */
  v3D(x: number = 0, y: number = 0, z: number = 0) {
    return new Vector([
      this.elements[0] !== undefined ? this.elements[0] : x,
      this.elements[1] !== undefined ? this.elements[1] : y,
      this.elements[2] !== undefined ? this.elements[2] : z,
    ]);
  }

  /**
   * Returns a copy of this vector, ensured as 4D.
   *
   * @param x - The fallback x-component if the current x-component
   * is undefined.
   * @param y - The fallback y-component if the current y-component
   * is undefined.
   * @param z - The fallback z-component if the current z-component
   * is undefined.
   * @param w - The fallback w-component if the current w-component
   * is undefined.
   */
  v4D(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    return new Vector([
      this.elements[0] !== undefined ? this.elements[0] : x,
      this.elements[1] !== undefined ? this.elements[1] : y,
      this.elements[2] !== undefined ? this.elements[2] : z,
      this.elements[3] !== undefined ? this.elements[3] : w,
    ]);
  }

  /**
   * Returns a copy of this vector with the x-component set to the
   * provided value.
   */
  vx(value: number) {
    return new Vector(this.elements.map((v, i) => i === 0 ? value : v));
  }
  /**
   * Returns a copy of this vector with the y-component set to the
   * provided value.
   */
  vy(value: number) {
    return new Vector(this.elements.map((v, i) => i === 1 ? value : v));
  }
  /**
   * Returns a copy of this vector with the z-component set to the
   * provided value (assuming the vector is a 3D vector).
   */
  vz(value: number) {
    return new Vector(this.elements.map((v, i) => i === 2 ? value : v));
  }

  /**
   * Returns a copy of this vector with the w-component set to the
   * provided value (assuming the vector is a 4D vector).
   */
  vw(value: number) {
    return new Vector(this.elements.map((v, i) => i === 3 ? value : v));
  }

  /**
   * The x-coordinate of this vector.
   * If no such coordinate exists, returns 0.
   */
  get x() {
    return this.elements[0] !== undefined ? this.elements[0] : 0;
  }

  /**
   * Sets the x-coordinate of this vector.
   */
  set x(value: number) {
    this.elements[0] = value;
  }

  /**
   * Returns the y-coordinate of this vector.
   * If no such coordinate exists, returns 0.
   */
  get y() {
    return this.elements[1] !== undefined ? this.elements[1] : 0;
  }

  /**
   * Sets the y-coordinate of this vector.
   */
  set y(value: number) {
    this.elements[1] = value;
  }

  /**
   * Returns the z-coordinate of this vector.
   * If no such coordinate exists, returns 0.
   */
  get z() {
    return this.elements[2] !== undefined ? this.elements[2] : 0;
  }

  /**
   * Sets the z-coordinate of this vector. This will
   * implicitly cast the vector to a 3D vector if
   * it isn’t already a 3D vector.
   */
  set z(value: number) {
    if (this.elements.length !== 3) {
      this.elements = [0, 0, 0];
    }
    this.elements[2] = value;
  }

  /**
   * Returns the w-coordinate of this vector.
   * If no such coordinate exists, returns 0.
   */
  get w() {
    return this.elements[3] !== undefined ? this.elements[3] : 0;
  }

  /**
   * Sets the z-coordinate of this vector. This will
   * implicitly cast the vector to a 3D vector if
   * it isn’t already a 3D vector.
   */
  set w(value: number) {
    if (this.elements.length !== 4) {
      this.elements = [0, 0, 0, 0];
    }
    this.elements[3] = value;
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

  mid2D(v: Vector) {
    return this.add(v).div(2);
  }

  p2D(vector: Vector) {
    this.x = vector.x;
    this.y = vector.y;
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
    if (this.elements[i - 1] !== undefined) {
      this.elements[i - 1] = value;
    }
    return this;
  }

  private binaryOp(
    arg: Vector | number | number[],
    f: (thisVector: number, arg: number) => number,
  ) {
    const other = typeof arg === "number"
      ? Vector.from(new Array(this.elements.length).fill(arg))
      : Vector.from(arg);
    for (let i = 1; i <= this.order; i++) {
      const a = this.n(i);
      const b = other.n(i);
      const c = f(a, b);
      this.elements[i - 1] = c;
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
  div(arg: Vector | number | number[]) {
    return this.copy().DIV(arg);
  }

  /**
   * __MUTATING METHOD__. Divides this
   * vector by the provided argument.
   * Note that vector divison is non-commutative.
   */
  DIV(arg: Vector | number | number[]) {
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
  sub(arg: Vector | number | number[]) {
    return this.copy().SUB(arg);
  }

  /**
   * __MUTATING METHOD__. Subtracts the
   * provided vector _from_ this vector.
   * Bear in mind that vector subtraction
   * is non-commutative.
   */
  SUB(arg: Vector | number | number[]) {
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
   * Returns true if this vector
   * and the provided vector are
   * pointing in roughly the same
   * direction (i.e., parallel).
   */
  acute(other: Vector) {
    const a = this.dot(other);
    return a > 0;
  }
  /**
   * Returns true if this vector
   * and the provided vector are
   * perpendicular.
   */
  aright(other: Vector) {
    const a = this.dot(other);
    return a === 0;
  }
  /**
   * Returns true if this vector
   * and the provided vector are
   * pointing in roughly
   * opposite directions.
   */
  obtuse(other: Vector) {
    const a = this.dot(other);
    return a < 0;
  }

  /**
   * __Non-mutating Method__. Returns
   * a new vector, based on multiplying
   * this vector by the provided vector.
   */
  mul(arg: Vector | number | number[]) {
    return this.copy().MUL(arg);
  }

  /**
   * __MUTATING METHOD__. Multiplies this
   * vector by the provided vector (scalar
   * multiplication if a number is passed,
   * pair-wise multiplication if a vector
   * is passed). For numbers, values between
   * 1 and 0 will “shrink” the vector, and
   * values great than 1 will "elongate"
   * the vector.
   */
  MUL(arg: Vector | number | number[]) {
    return this.binaryOp(arg, (thisVector, arg) => thisVector * arg);
  }

  /**
   * __Non-mutating Method__. Returns
   * a new vector, based on adding
   * the provided vector to this vector.
   */
  add(arg: Vector | number | number[]) {
    return this.copy().ADD(arg);
  }

  /**
   * __MUTATING METHOD__. Adds the
   * provided vector this vector.
   */
  ADD(arg: Vector | number | number[]) {
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
    if (this.length !== that.length) return false;
    for (let i = 0; i < this.length; i++) {
      const e1 = this.elements[i];
      const e2 = that.elements[i];
      if (e1 !== e2) return false;
    }
    return true;
  }

  /**
   * Returns the number of components in this
   * vector. For the mathematical “length” of
   * a vector, see {@link Vector.mag}.
   */
  get length() {
    return this.elements.length;
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
    for (let i = 0; i < this.length; i++) {
      if (this.elements[i] !== 0) return false;
    }
    return true;
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
  normalize() {
    return this.copy().NORMALIZE();
  }

  /**
   * __Mutating Method__. Sets this
   * vector to its normal
   */
  NORMALIZE() {
    if (this.isZero()) return this;
    return this.DIV(this.mag());
  }

  /**
   * Returns a new 2D vector normal to
   * this vector.
   */
  normal2D() {
    return new Vector([-this.y, this.x]);
  }

  /**
   * Returns the dot product of
   * this vector and the provided
   * vector.
   */
  dot(vector: Vector | number[]) {
    const other = Vector.from(vector);
    const order = this.length;
    if (other.length !== order) return 0;
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
   * vector as a new vector. Note that in
   * this library, the cross product
   * is only defined for 3D vectors.
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
  euclideanDistance(other: Vector) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dsum = (dx ** 2) + (dy ** 2);
    return Math.sqrt(dsum);
  }

  /**
   * Returns the 3D distance between this
   * vector and the provided vector.
   */
  d3(other: Vector) {
    const x = other.x - this.x;
    const y = other.y - this.y;
    const z = other.z - this.z;
    const xyz = (x * x) + (y * y) + (z * z);
    return Math.sqrt(xyz);
  }

  /**
   * Returns the projection of
   * this vector (𝑏) onto the
   * provided vector (𝑎) (projₐ𝑏).
   * That is, the projection of 𝑏
   * onto 𝑎.
   */
  project(a: Vector): Vector {
    const b = this.copy();
    const prod = a.dot(b);
    const mag = a.mag();
    const mag2 = mag * mag;
    const factor = prod / mag2;
    const res = a.mul(factor);
    return res;
  }

  /**
   * Returns a copy of this vector.
   */
  copy() {
    return new Vector(this.elements);
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
      return value;
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
  /**
   * Returns a random 2D vector.
   * @param min - The lower bound of the sampling interval.
   * @param max - The upper bound of the sampling interval.
   * @param restrict - If `Z` is passed, random values are
   * restricted to integers. If `R` is passed, random values
   * are either integers or floats.
   */
  static random2D(min: number, max: number, restrict: "Z" | "R" = "R") {
    const rfn = (restrict === "Z") ? randInt : randFloat;
    const x = rfn(min, max);
    const y = rfn(min, max);
    return new Vector([x, y]);
  }
  /**
   * Returns a random 2D vector.
   * @param min - The lower bound of the sampling interval.
   * @param max - The upper bound of the sampling interval.
   * @param restrict - If `Z` is passed, random values are
   * restricted to integers. If `R` is passed, random values
   * are either integers or floats.
   */
  static random3D(min: number, max: number, restrict: "Z" | "R" = "R") {
    const v = Vector.random2D(min, max, restrict);
    const x = v.x;
    const y = v.y;
    const z = restrict === "Z" ? randInt(min, max) : randFloat(min, max);
    return new Vector([x, y, z]);
  }
}

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

// deno-fmt-ignore
export const binop2D = (op: (a: number, b: number) => number) => (
  a: Vector,
  b: Vector,
) => v2(op(a.x, b.x), op(a.y, b.y));

/**
 * Returns the 2D vector sum.
 */
export const add2D = binop2D((a, b) => a + b);
/**
 * Returns the 2D vector difference.
 */
export const sub2D = binop2D((a, b) => a - b);
/**
 * Returns the 2D vector multiplication.
 */
export const mul2D = binop2D((a, b) => a * b);
/**
 * Returns the 2D vector scalar division.
 */
export const div2D = (a: Vector, n: number) =>
  v2(
    (a.x / n) || 0,
    (a.y / n) || 0,
  );
/**
 * Returns the 2D vector magnitude.
 */
export const mag2D = (vector: Vector) => (
  Math.sqrt((vector.x ** 2) + (vector.y ** 2))
);
/**
 * Returns the 2D vector’s normal.
 */
export const normal2D = (vector: Vector) => (
  v2(-vector.y, vector.x)
);
/**
 * Returns the 2D vector’s unit vector.
 */
export const normalized2D = (vector: Vector) => (
  div2D(vector, mag2D(vector))
);
/**
 * Returns the euclidean distance between the
 * two 2D vectors.
 */
export const distance2D = (u: Vector, v: Vector) => {
  const x1 = u.x;
  const y1 = u.y;
  const x2 = v.x;
  const y2 = v.y;
  const dx = x1 - x2;
  const dy = y1 - y2;
  const sum = (dx ** 2) + (dy ** 2);
  return sum > 0 ? Math.sqrt(sum) : 0;
};
