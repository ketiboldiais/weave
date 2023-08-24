const {
  floor,
  abs,
  min,
  max,
  PI,
  E,
  tan,
  sin,
  cos,
  cosh,
  sinh,
  tanh,
  log2: lg,
  log: ln,
  log10: log,
  acosh: arccosh,
  asinh: arcsinh,
  atan: arctan,
  sign,
  ceil,
  exp,
  sqrt,
} = Math;
const HALF_PI = PI / 2;

/** Global maximum integer. */
const MAX_INT = Number.MAX_SAFE_INTEGER;

/** An object that serves as a coordinate space. The ctx is used by the graphics module to scale coordinates according to a given screen (as supplied by the user).*/
class Context {
  /** The figure’s margins. */
  _margins: [number, number, number, number] = [50, 50, 50, 50];

  /** The camera’s coordinates' x-domain. */
  _domain: [number, number] = [-10, 10];

  /** Sets the camera’s x-coordinates' bounds. */
  domain(x: number, y: number) {
    (x < y) && (this._domain = [x, y]);
    return this;
  }

  /** The camera’s coordinates' y-domain. */
  _range: [number, number] = [-10, 10];

  /** Sets the camera’s y-coordinates' bounds. */
  range(x: number, y: number) {
    (x < y) && (this._range = [x, y]);
    return this;
  }

  /** The camera’s viewport width. */
  _width: number;

  /** Sets the camera’s viewport width. */
  width(value: number) {
    (value > 1) && (this._width = floor(value));
    return this;
  }

  /** The camera’s viewport height. */
  _height: number;

  /** Sets the cameraks viewport height. */
  height(value: number) {
    (value > 1) && (this._height = floor(value));
    return this;
  }

  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }
}

/** Returns a new ctx. */
export function ctx(width: number, height: number) {
  return new Context(width > 0 ? width : 500, height > 0 ? height : 500);
}

/*
┌─────────────────────────────────────────────────────────────────────────┐
│ GEOMETRY FUNCTIONS                                                      │
│ These are functions related to common computations in Euclidean         │
│ geometry.                                                               │
└─────────────────────────────────────────────────────────────────────────┘
*/

/** Converts the provided number (assumed to be radians) to degrees. */
function toDegrees(radians: number) {
  return radians * (180 / Math.PI);
}

/** Converts the provided number (assumed to be degrees) to radians. */
function toRadians(degrees: number) {
  return degrees * (Math.PI / 180);
}

/** Returns the arccosine of x. */
function arccos(x: number) {
  return (x > 1 ? 0 : x < -1 ? PI : Math.acos(x));
}

/** Returns the arcsine of x. */
function arcsin(x: number) {
  return (x >= 1 ? HALF_PI : x <= -1 ? -HALF_PI : Math.asin(x));
}

/*
┌─────────────────────────────────────────────────────────────────────────┐
│ STATISTICAL FUNCTIONS                                                   │
│ These functions relate to statistics.                                   │
└─────────────────────────────────────────────────────────────────────────┘
*/

/** Returns a random integer between the provided minimum and maximum (not including the maximum). */
function randInt(min: number, max: number) {
  return (
    floor(Math.random() * (max - min + 1)) + min
  );
}

/** Returns a random floating point number between the provided minimum and maximum (not including the maximum). */
function randFloat(min: number, max: number) {
  return (
    Math.random() * (max - min) + min
  );
}

/** Transforms 1-based indices to 0-based indices. */
function i0(value: number) {
  return value === 0 ? 0 : value - 1;
}

/** Rounds the given number value to the number of given decimal places. */
function round(num: number, places: number = 2) {
  const epsilon = Number.EPSILON;
  return (
    Math.round(
      (num * (10 ** places)) * (1 + epsilon),
    ) / (10 ** places)
  );
}

/** Computes the arithmetic mean of the given list of numbers. */
function avg(...nums: number[]) {
  let sum = 0;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
  }
  return sum / nums.length;
}

/** Returns the a% of b. */
function percent(a: number, b: number) {
  return (a / 100) * b;
}

/** Returns `a rem b` (the signed remainder). */
function rem(a: number, b: number) {
  return (a % b);
}

/** Returns `a mod b` (the unsigned remainder). */
function mod(a: number, b: number) {
  return (
    ((a % b) + b) % b
  );
}

/** Returns the integer quotient of `a` and `b`. */
function quot(a: number, b: number) {
  return (floor(a / b));
}

/** Returns a tuple. */
function tuple<T extends any[]>(...data: T) {
  return data;
}

/** Returns the greatest common divisor of integers `a` and `b`. */
function gcd(a: number, b: number) {
  let A = floor(a);
  let B = floor(b);
  while (B !== 0) {
    let R = rem(A, B);
    A = B;
    B = R;
  }
  return abs(A);
}

/** Returns the triple of applying the extended Euclidean algorithm. */
function xgcd(a: number, b: number) {
  let A = floor(a);
  let B = floor(b);
  let mpp = 1;
  let mp = 0;
  let npp = 0;
  let np = 1;
  while (B !== 0) {
    let Q = quot(A, B);
    let R = rem(A, B);
    A = B;
    B = R;
    let m = mpp - Q * mp;
    let n = npp - Q * np;
    mpp = mp;
    mp = m;
    npp = np;
    np = n;
  }
  if (A >= 0) {
    return tuple(A, mpp, npp);
  } else {
    return tuple(-A, -mpp, -npp);
  }
}

/** Returns the clamping of the given input. I.e., if `input` is less than `min`, returns `min`. If `input` is greater than `max`, returns `max`. Otherwise, returns `input`. */
function clamp(minimum: number, input: number, maximum: number) {
  return min(max(input, minimum), maximum);
}

/** Given the number pair `(x1,x2)` returns the value between `x1` and `x2` at `p` percent of the dsitance between `x1` and `x2`. Useful for computations like: “What x-coordinate is 35% between 46 and 182?” Note that the percentage `p` is assumed to be between `0` and `1`. */
function lerp([x1, x2]: [number, number], p: number) {
  return (
    x1 * (1 - p) + x2 * p
  );
}

/** Given the number pair `(x,y)`, returns the value at the given decimal point `a`. Used primarily for computations like: How far through this line has this point moved? */
function inverseLerp([x, y]: [number, number], a: number) {
  return clamp(0, (a - x) / (y - x), 1);
}

/** Returns a linear interpolator. The `domain` is the interval of input values – a pair of numbers `(a,b)` where `a` is the smallest possible input and `b` is the largest. The `range` is the interval of scale values - a pair of numbers `(a,b)` where `a` is the smallest possible scaled value and `b` is the largest. */
function interpolator(domain: [number, number], range: [number, number]) {
  return (n: number) => (
    (range[0]) + ((
      ((range[1]) - (range[0])) / ((domain[1]) - (domain[0]))
    ) * (n - (domain[0])))
  );
}

/** Interpolates the number `n` based on the specified domain and range. */
function iterpolate(
  n: number,
  domain: [number, number],
  range: [number, number],
) {
  return (
    interpolator(domain, range)(n)
  );
}

/** Utility method - Logs to the console. */
const print = console.log;

/*
┌─────────────────────────────────────────────────────────────────────────┐
│ TYPEGUARDS                                                              │
│ These functions verify and claim that                                   │
│ their given arguments are of a particular type.                         │
└─────────────────────────────────────────────────────────────────────────┘
*/

/** Typeguard: Returns true if `x` is any string, false otherwise. */
function $isString(x: any): x is string {
  return (typeof x === "string");
}

/** Typeguard: Returns true if `x` is any number, false otherwise. */
function $isNumber(x: any): x is number {
  return (typeof x === "number");
}

/** Typeguard: Returns true if `x` is any array, false otherwise. */
function $isArray(x: any): x is any[] {
  return (Array.isArray(x));
}

/** Typeguard: Returns true if `x` is a boolean, false otherwise. */
function $isBoolean(x: any): x is boolean {
  return (typeof x === "boolean");
}

/** Typeguard: Returns true if `x` is NaN, false otherwise.. */
function $isNaN(x: any) {
  return Number.isNaN(x);
}

/** Typeguard : Returns true if `x` is Undefined or null. */
function $isNothing(x: any): x is undefined | null {
  return (
    (x === undefined) || (x === null)
  );
}

/** Typeguard: Returns true if `x` is an integer. */
function $isInt(x: number) {
  return Number.isInteger(x);
}

/** Typeguard: Returns true if `x` is Infinity. */
function $isInfinity(x: any) {
  return !(Number.isFinite(x));
}

/** Typeguard: Returns true if `x` is a big integer. */
function $isBigInt(x: any): x is bigint {
  return (typeof x === "bigint");
}

/** Typeguard: Returns true if `x` is any object. */
function $isObject(x: any): x is Object {
  return (typeof x === "object");
}

/** Typeguard: Returns true `x` is a function. */
function $isFunction(x: any): x is Function {
  return (typeof x === "function");
}

/** Returns true if the given string contains digits. */
function isNumericString(s: string) {
  return /\d+/.test(s);
}

// ============================================================ VECTOR DATA TYPE

class Vector<T extends number[] = number[]> {
  /** The elements of this vector. */
  elements: T;

  constructor(elements: T) {
    this.elements = elements;
  }

  vxm(matrix: Matrix) {
    if (this.length !== matrix.C) return this;
    const vector = new Vector([] as number[]);
    for (let i = 1; i <= matrix.R; i++) {
      const v = matrix.row(i);
      if (v === null) return this;
      const d = this.dot(v);
      vector.elements[i - 1] = d;
    }
    print(vector);
    return vector;
  }

  /** @internal Utility method for performing binary operations. */
  private binop(
    other: Vector | number[] | number,
    op: (a: number, b: number) => number,
  ) {
    const arg = ($isNumber(other))
      ? homogenousVector(other, this.length)
      : vector(other);
    const [A, B] = equalen(this, arg);
    return vector(A.elements.map((c, i) => op(c, B.elements[i])));
  }

  /** Returns the smallest component of this vector. */
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

  /** Returns the largest component of this vector. */
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

  /** Returns this vector as a matrix. */
  matrix() {
    const elements = this.elements.map((n) => new Vector([n]));
    return new Matrix(elements, elements.length, 1);
  }

  /** Returns the magnitude of this vector.  An optional precision value may be passed roundingthe magnitude to a specified number of decimal places. */
  mag(precision?: number) {
    const out = sqrt(this.elements.reduce((p, c) => (p) + (c ** 2), 0));
    return !$isNothing(precision) ? round(out, floor(precision)) : out;
  }

  /** Returns the difference between this vector and the provided argument. If a number is passed, returns the scalar difference. */
  sub(other: Vector | number[] | number) {
    return this.binop(other, (a, b) => a - b);
  }

  /** Returns the product between this vector and the provided argument. If a number is passed, returns the scalar difference. */
  mul(other: Vector | number[] | number) {
    return this.binop(other, (a, b) => a * b);
  }

  /** Returns this pair-wise power of this vector to the provided argument. If a number is passed, returns the scalar difference. */
  pow(other: Vector | number[] | number) {
    return this.binop(other, (a, b) => a ** b);
  }

  /** Returns the sum of this vector and the provided argument. If a number is passed, returns the scalar difference. */
  add(other: Vector | number[] | number) {
    return this.binop(other, (a, b) => a + b);
  }

  /** Returns the component-wise division of this vector. */
  div(other: Vector | number[] | number) {
    return this.binop(other, (a, b) => b === 0 ? a / 0.0001 : a / b);
  }

  /** Magnifies this vector by the given magnitude. */
  magnify(magnitude: number) {
    const mag = this.mag();
    const ratio = magnitude / mag;
    return this.mul(ratio);
  }

  /** Returns this vector with each component squared. */
  square() {
    return this.mul(this);
  }

  /** Returns the negation of this vector. */
  neg() {
    return vector(this.elements.map((c) => -c));
  }

  /** Returns this vector with each component set to its absolute value. */
  abs() {
    return vector(this.elements.map((c) => Math.abs(c)));
  }

  /** Returns this vector with each component set to zero */
  zero() {
    return vector(this.elements.map((_) => 0));
  }

  /** Returns true if this vector equals the provided vector. */
  equals(that: Vector) {
    if (this.length !== that.length) return false;
    for (let i = 0; i < this.length; i++) {
      const e1 = this.elements[i];
      const e2 = that.elements[i];
      if (e1 !== e2) return false;
    }
    return true;
  }

  /** Returns true if every component of this vector is zero. */
  isZero() {
    for (let i = 0; i < this.length; i++) {
      if (this.elements[i] !== 0) return false;
    }
    return true;
  }

  /** Returns true if this vector comprises exactly two elements. */
  is2D(): this is Vector<[number, number]> {
    return this.elements.length === 2;
  }

  /** Returns true if this vector comprises exactly three elements. */
  is3D(): this is Vector<[number, number, number]> {
    return this.elements.length === 3;
  }

  /** Returns a copy of this vector. */
  copy() {
    const elements = [];
    for (let i = 0; i < this.elements.length; i++) {
      elements.push(this.elements[i]);
    }
    return new Vector(elements);
  }

  /** Appends the given value by the provided number of slots. */
  pad(slots: number, value: number) {
    if (slots < this.length) {
      const diff = this.length - slots;
      const elements = [...this.elements];
      for (let i = 0; i < diff; i++) {
        elements.push(value);
      }
      return new Vector(elements);
    }
    return this.copy();
  }

  /** Sets the element at the given position to the provided value. Indices start at 1. If the index is greater than the current size of this vector, the vector will insert additional zeros up to the given index to ensure its elements array is contiguous. */
  set(index: number, value: number) {
    index = i0(index);
    if (index > this.length) {
      const diff = index - this.length;
      const vector = this.pad(diff, 0);
      vector.elements[index] = value;
      return vector;
    }
    const copy = this.copy();
    copy.elements[index] = value;
    return copy;
  }

  /** Sets the first element of this vector to the provided value. */
  px(value: number) {
    return this.set(1, value);
  }

  /** Returns the first element of this vector. */
  get x() {
    return $isNothing(this.elements[0]) ? 0 : this.elements[0];
  }

  /** Sets the second element of this vector to the provided value. */
  py(value: number) {
    return this.set(2, value);
  }

  /** Returns the second element of this vector. */
  get y() {
    return $isNothing(this.elements[1]) ? 0 : this.elements[1];
  }

  /** Sets the third element of this vector to the provided value. */
  pz(value: number) {
    return this.set(3, value);
  }

  /** Returns the third element of this vector. */
  get z() {
    return $isNothing(this.elements[2]) ? 0 : this.elements[2];
  }

  /** Sets the fourt element of this vector to the provided value. */
  pw(value: number) {
    return this.set(4, value);
  }

  /** Returns the fourth element of this vector. */
  get w() {
    return $isNothing(this.elements[3]) ? 0 : this.elements[3];
  }

  /** Returns the dot product of this vector and the provided vector. */
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

  /** Returns the element at the given index (indices start at 1). */
  element(index: number) {
    const out = this.elements[index - 1];
    return (out !== undefined) ? out : null;
  }

  /** Returns the length of this vector. */
  get length() {
    return this.elements.length;
  }

  /** Returns the string representation of this vector. */
  toString() {
    const elements = this.elements.map((n) => `${n}`).join(",");
    return `[${elements}]`;
  }

  /** Returns this vector as a number array. */
  toArray() {
    return this.elements.map((e) => e);
  }

  /** Returns a new vector from the given array of numbers or `Vector`. If a `Vector` is passed, returns a copy of that vector. */
  static from(value: number[] | Vector): Vector {
    if ($isArray(value)) {
      return new Vector(value);
    } else {
      return value.copy();
    }
  }

  /** Returns the angle between the two provided vectors. */
  theta(other: Vector) {
    const ab = this.dot(other);
    const mag = this.mag();
    const factor = ab / (mag);
    return Math.acos(factor);
  }

  /** Returns the angle between (a) the difference vector of this vector and the provided vector, and (b) the x-axis. */
  gamma(other: Vector) {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    const gamma = Math.atan2(dy, dx);
    return gamma;
  }

  /** Returns the unit vector point from this vector 𝑢 to the provided 𝑣. */
  normalTo(v: Vector) {
    const d = this.sub(v);
    return d.normalize();
  }

  /** Returns this vector’s normal. */
  normalize() {
    if (this.isZero()) return this;
    return this.div(this.mag());
  }

  /** Returns the 2D vector normal of this vector. */
  normal2D() {
    return vector([-this.y, this.x]);
  }

  /** Returns the cross product of this vector in-place. The cross product is used primarily to compute the vector perpendicular to two vectors. */
  cross(other: Vector) {
    const ax = this.x;
    const ay = this.y;
    const az = this.z;
    const bx = other.x;
    const by = other.y;
    const bz = other.z;
    const cx = (ay * bz) - (az * by);
    const cy = (az * bx) - (ax * bz);
    const cz = (ax * by) - (ay * bx);
    return vector([cx, cy, cz]);
  }

  /** Returns the 2D distance between this vector and the provided vector. */
  distance2D(other: Vector) {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const dsum = (dx ** 2) + (dy ** 2);
    return Math.sqrt(dsum);
  }

  /** Returns the 3D distance between this vector and the provided vector. */
  distance3D(other: Vector) {
    const x = other.x - this.x;
    const y = other.y - this.y;
    const z = other.z - this.z;
    const xyz = (x * x) + (y * y) + (z * z);
    return Math.sqrt(xyz);
  }

  /** Returns the projection of this vector (𝑏) onto the provided vector (𝑎) (projₐ𝑏). That is, the projection of 𝑏 onto 𝑎. */
  project(a: Vector): Vector {
    const b = this.copy();
    const prod = a.dot(b);
    const mag = a.mag();
    const mag2 = mag * mag;
    const factor = prod / mag2;
    const res = a.mul(factor);
    return res;
  }

  /** Returns a random 2D vector. The `min` argument is the lower bound of the sampling interval. The `max` argument is The upper bound of the sampling interval. The `restrict` argument takes string values `Z` or `R`. If `Z` is passed, random values are restricted to integers. If `R` is passed, random values are either integers or floats. */
  static random2D(min: number, max: number, restrict: "Z" | "R" = "R") {
    const rfn = (restrict === "Z") ? randInt : randFloat;
    const x = rfn(min, max);
    const y = rfn(min, max);
    return new Vector([x, y]);
  }

  /** Returns a random 3D vector. The `min` argument sets the lower bound of the sampling interval. The `max` argument sets the upper bound of the sampling interval. The `restrict` argument takes `Z` or `R`. If `Z` is passed, random values are restricted to integers. If `R` is passed, random values are either integers or floats. */
  static random3D(min: number, max: number, restrict: "Z" | "R" = "R") {
    const v = Vector.random2D(min, max, restrict);
    const x = v.x;
    const y = v.y;
    const z = restrict === "Z" ? randInt(min, max) : randFloat(min, max);
    return new Vector([x, y, z]);
  }
}

/** Given `vectorA` and `vectorB`, ensures that `vectorA` and `vectorB` have the same sizes (number of elements). If one is smaller than the other, the shorter is padded with additional zeros to ensure the lengths are the same. */
function equalen(vectorA: Vector, vectorB: Vector): [Vector, Vector] {
  const A = [];
  const B = [];
  if (vectorA.length > vectorB.length) {
    let i = 0;
    for (i = 0; i < vectorA.length; i++) {
      A.push(vectorA.elements[i]);
      B.push($isNothing(vectorB.elements[i]) ? 0 : vectorB.elements[i]);
    }
    const n = vectorB.length - i;
    for (let j = 0; j < n; j++) {
      B.push(0);
    }
    return [vector(A), vector(B)];
  } else if (vectorA.length < vectorB.length) {
    let i = 0;
    for (i = 0; i < vectorB.length; i++) {
      A.push($isNothing(vectorA.elements[i]) ? 0 : vectorA.elements[i]);
      B.push(vectorB.elements[i]);
    }
    const n = vectorB.length - i;
    for (let j = 0; j < n; j++) {
      A.push(0);
    }
    return [vector(A), vector(B)];
  } else {
    return [vectorA, vectorB];
  }
}

/** Returns a new vector of size `length`, where each element is the given `value`.*/
function homogenousVector(value: number, length: number) {
  const elements = [];
  for (let i = 0; i < length; i++) {
    elements.push(value);
  }
  return new Vector(elements);
}

/** Returns a new vector. If a vector is passed, returns the vector (an identity function). */
function vector(elements: number[] | Vector) {
  if ($isArray(elements)) {
    return new Vector(elements);
  } else {
    return elements;
  }
}

const $isVector = (value: any): value is Vector => (value instanceof Vector);

// ============================================================ MATRIX DATA TYPE

class Matrix {
  vectors: Vector[];
  R: number;
  C: number;
  constructor(vectors: Vector[], rows: number, cols: number) {
    this.vectors = vectors;
    this.R = rows;
    this.C = cols;
  }
  /** Returns true if this matrix is a square matrix. */
  get square() {
    return this.C === this.R;
  }

  /** Returns a copy of this matrix. */
  copy() {
    const vs = this.vectors.map((v) => v.copy());
    return new Matrix(vs, this.R, this.C);
  }

  /** Returns the vector element at the given index (indices start at 1). */
  element(index: number) {
    const out = this.vectors[index - 1];
    return out !== undefined ? out : null;
  }
  /** Returns the vector element at the given index (indices start at 1). */
  row(index: number) {
    return this.element(index);
  }
  /** Returns a column vector comprising all the vector elements at the given column. */
  column(index: number) {
    if (index > this.C) {
      const out: number[] = [];
      for (let i = 0; i < this.C; i++) {
        out.push(0);
      }
      return vector(out);
    }
    const out: number[] = [];
    this.vectors.forEach((vector) => {
      vector.elements.forEach((n, i) => {
        if (i === index) out.push(n);
      });
    });
    return vector(out);
  }

  /** Returns the nth element at the given row index and column index. An optional fallback value (defaulting to 0) may be provided in the event the indices are out of bounds. */
  n(rowIndex: number, columnIndex: number, fallback: number = 0) {
    const out = this.row(rowIndex);
    if (out === null) return fallback;
    const n = out.element(columnIndex);
    return $isNumber(n) ? n : fallback;
  }

  /** Returns the string form of matrix. */
  toString() {
    const out = this.vectors.map((v) => v.toString()).join(",");
    return `[${out}]`;
  }

  /** Sets the element at the given row index and column index. The row and column indices are expected to begin at 1. If no element exists at the provided indices, no change is done. */
  set(row: number, column: number, value: number) {
    if (this.vectors[row - 1] === undefined) return this;
    if (this.vectors[row - 1].elements[column - 1] === undefined) return this;
    const copy = this.copy();
    copy.vectors[row - 1].elements[column - 1] = value;
    return copy;
  }

  /** Executes the given callback over each element of this matrix. The row and column index provided in the callback begin at 1. */
  forEach(
    callback: (element: number, rowIndex: number, columnIndex: number) => void,
  ) {
    for (let i = 1; i <= this.R; i++) {
      for (let j = 1; j <= this.C; j++) {
        callback(this.n(i, j), i, j);
      }
    }
    return this;
  }

  /** Returns true if this matrix and the the provided matrix have the same number of rows and the same number of columns. False otherwise. */
  congruent(matrix: Matrix) {
    return this.R === matrix.R && this.C === matrix.C;
  }
  static fill(rows: number, columns: number, arg: number) {
    const vectors: Vector[] = [];
    for (let i = 0; i < rows; i++) {
      const nums: number[] = [];
      for (let j = 0; j < columns; j++) {
        nums.push(arg);
      }
      vectors.push(vector(nums));
    }
    return matrix(vectors);
  }

  static from(nums: (number[])[]) {
    const out = nums.map((ns) => vector(ns));
    return matrix(out);
  }
  static of(
    rows: number,
    columns: number,
    arg: number | (number[])[] | Matrix,
  ) {
    return $isNumber(arg)
      ? Matrix.fill(rows, columns, arg)
      : $isArray(arg)
      ? Matrix.from(arg)
      : arg;
  }

  /** @internal - Utility method for binary operations on matrices. */
  private binop(
    arg: number | (number[])[] | Matrix,
    op: (a: number, b: number) => number,
  ) {
    const other = $isNumber(arg)
      ? Matrix.fill(this.R, this.C, arg)
      : $isArray(arg)
      ? Matrix.from(arg)
      : arg;
    if (this.R !== other.R || this.C !== other.C) return this;
    const vectors: Vector[] = [];
    for (let i = 0; i < this.R; i++) {
      const nums: number[] = [];
      const row = this.vectors[i].elements;
      for (let j = 0; j < row.length; j++) {
        const a = row[j];
        const b = other.vectors[i].elements[j];
        nums.push(op(a, b));
      }
      vectors.push(vector(nums));
    }
    return matrix(vectors);
  }

  /** Returns this matrix minus the provided matrix. */
  sub(matrix: Matrix | number | (number[])[]) {
    return this.binop(matrix, (a, b) => a - b);
  }

  /** Returns this matrix component-wise-multiplied with provided matrix. */
  times(matrix: Matrix | number | (number[])[]) {
    return this.binop(matrix, (a, b) => a * b);
  }

  /** Returns this matrix plus the provided matrix. */
  add(matrix: Matrix | number | (number[])[]) {
    return this.binop(matrix, (a, b) => a + b);
  }

  /** Returns the negation of this matrix.  */
  neg() {
    return this.times(-1);
  }

  /** Returns the transpose of this matrix. */
  transpose() {
    const copy: (number[])[] = [];
    for (let i = 0; i < this.R; ++i) {
      const vector = this.vectors[i];
      for (let j = 0; j < this.C; ++j) {
        const element = vector.elements[j];
        if ($isNothing(element)) continue;
        if ($isNothing(copy[j])) {
          copy[j] = [];
        }
        copy[j][i] = element;
      }
    }
    return matrix(copy.map((c) => vector(c)));
  }

  /** Returns an array of generic K, where K is the result of applying the callback function on each vector of this matrix. */
  vmap<K>(
    callback: (vector: Vector, rowIndex: number, matrix: Matrix) => K,
  ): K[] {
    const out: K[] = [];
    const mtx = this.copy();
    for (let i = 0; i < this.R; i++) {
      const v = this.vectors[i];
      const rowIndex = i + 1;
      const k = callback(v, rowIndex, mtx);
      out.push(k);
    }
    return out;
  }

  /** Returns the matrix product of this matrix and the provided matrix. */
  mul(arg: number | Matrix | (number[])[]) {
    const Ar = this.R;
    const Ac = this.C;
    if (arg instanceof Matrix && Ac !== arg.R) {
      return this;
    }
    const B = Matrix.of(Ar, Ac, arg);
    const Bc = B.C;
    const result: (number[])[] = [];
    for (let i = 0; i < Ar; i++) {
      result[i] = [];
      for (let j = 0; j < Bc; j++) {
        let sum = 0;
        for (let k = 0; k < Ac; k++) {
          const a = this.vectors[i].elements[k];
          const b = B.vectors[k].elements[j];
          sum += a * b;
        }
        result[i][j] = sum;
      }
    }
    return matrix(result.map((r) => vector(r)));
  }

  /** Returns true if this matrix and the provided matrix are equal. */
  equals(matrix: Matrix) {
    if (!this.congruent(matrix)) return false;
    let out = true;
    this.forEach((n, r, c) => {
      const m = matrix.n(r, c);
      if (m !== n) out = false;
    });
    return out;
  }
}

/** Returns a new matrix. */
function matrix(rows: (Vector[]) | (number[])[], cols?: number) {
  const vectors = rows.map((v) => $isVector(v) ? v : Vector.from(v));
  return new Matrix(
    vectors,
    vectors.length,
    cols !== undefined ? cols : vectors[0].length,
  );
}

/** Returns true if the given value is a matrix. */
const $isMatrix = (value: any): value is Matrix => (value instanceof Matrix);

/** An enum of types mapped to SVG Path command prefixes. */
// deno-fmt-ignore
enum pc { M, L, H, V, Q, C, A, }

interface PathCommandVisitor<T> {
  M(visitor: MCommand): T;
  L(visitor: LCommand): T;
  H(visitor: HCommand): T;
  V(visitor: VCommand): T;
  Q(visitor: QCommand): T;
  C(visitor: CCommand): T;
  A(visitor: ACommand): T;
}

abstract class PathCommand {
  readonly type: pc;
  end: Vector;
  constructor(type: pc, end: Vector) {
    this.type = type;
    this.end = end;
  }
  abstract accept<T>(visitor: PathCommandVisitor<T>): T;

  /** Sets the endpoint for this command. */
  abstract endPoint(x: number, y: number, z?: number): PathCommand;

  /** Returns the string value for this command. */
  abstract toString(): string;
}

class MCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.M(this);
  }
  readonly type: pc.M;
  constructor(x: number, y: number, z: number) {
    super(pc.M, vector([x, y, z]));
    this.type = pc.M;
  }
  endPoint(x: number, y: number, z: number = 1): MCommand {
    return new MCommand(x, y, z);
  }
  toString() {
    return `M${this.end.x},${this.end.y}`;
  }
}

/** Returns a new {@link MCommand|M-command}. */
const M = (x: number, y: number, z: number = 1) => (new MCommand(x, y, z));

class LCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.L(this);
  }
  readonly type: pc.L;
  constructor(x: number, y: number, z: number) {
    super(pc.L, vector([x, y, z]));
    this.type = pc.L;
  }
  endPoint(x: number, y: number, z: number = 1): LCommand {
    return new LCommand(x, y, z);
  }
  toString() {
    return `L${this.end.x},${this.end.y}`;
  }
}
/** Returns a new {@link LCommand|L-command}. */
const L = (x: number, y: number, z: number = 1) => (new LCommand(x, y, z));

class VCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.V(this);
  }
  readonly type: pc.V;
  constructor(x: number, y: number, z: number) {
    super(pc.V, vector([x, y, z]));
    this.type = pc.V;
  }
  endPoint(x: number, y: number, z: number = 1): VCommand {
    return new VCommand(x, y, z);
  }
  toString() {
    return `V${this.end.x},${this.end.y}`;
  }
}
/** Returns a new {@link VCommand|V-command}. */
const V = (x: number, y: number, z: number = 1) => (new VCommand(x, y, z));

class HCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.H(this);
  }
  readonly type: pc.H;
  constructor(x: number, y: number, z: number) {
    super(pc.H, vector([x, y, z]));
    this.type = pc.H;
  }
  endPoint(x: number, y: number, z: number = 1): HCommand {
    return new HCommand(x, y, z);
  }
  toString() {
    return `H${this.end.x},${this.end.y}`;
  }
}

/** Returns a new {@link HCommand|H-command}. */
const H = (x: number, y: number, z: number = 1) => (new HCommand(x, y, z));

class QCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.Q(this);
  }
  readonly type: pc.Q = pc.Q;
  ctrl1: Vector;
  constructor(x: number, y: number, z: number) {
    super(pc.Q, vector([x, y, z]));
    this.ctrl1 = vector([x, y, z]);
  }
  ctrlPoint(x: number, y: number, z: number = 1): QCommand {
    const out = new QCommand(this.end.x, this.end.y, this.end.z);
    out.ctrl1 = vector([x, y, z]);
    return out;
  }
  endPoint(x: number, y: number, z: number = 1): QCommand {
    return new QCommand(x, y, z);
  }
  toString() {
    return `Q${this.ctrl1.x},${this.ctrl1.y},${this.end.x},${this.end.y}`;
  }
}

/** Returns a new quadratic bezier curve command. */
const Q = (x: number, y: number, z: number = 1) => (new QCommand(x, y, z));

/** A type corresponding to the SVG cubic-bezier-curve command. */
class CCommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.C(this);
  }
  type: pc.C = pc.C;
  ctrl1: Vector = vector([0, 0, 1]);
  ctrl2: Vector = vector([0, 0, 1]);
  constructor(x: number, y: number, z: number = 1) {
    super(pc.C, vector([x, y, z]));
  }
  copy() {
    const out = new CCommand(this.end.x, this.end.y, this.end.z);
    out.ctrl1 = this.ctrl1.copy();
    out.ctrl2 = this.ctrl2.copy();
    return out;
  }
  /** Sets the second control point for this cubic bezier curve. */
  ctrlPoint2(x: number, y: number, z: number = 1) {
    const out = new CCommand(this.end.x, this.end.y, this.end.z);
    out.ctrl2 = vector([x, y, z]);
    return out;
  }
  /** Sets the first control point for this cubic bezier curve. */
  ctrlPoint1(x: number, y: number, z: number = 1) {
    const out = new CCommand(this.end.x, this.end.y, this.end.z);
    out.ctrl1 = vector([x, y, z]);
    return out;
  }
  endPoint(x: number, y: number, z: number = 1): CCommand {
    return new CCommand(x, y, z);
  }
  toString() {
    return `C${this.ctrl1.x},${this.ctrl1.y},${this.ctrl2.x},${this.ctrl2.y},${this.end.x},${this.end.y}`;
  }
}

/** Returns a new cubic bezier curve command. */
const C = (x: number, y: number, z: number = 1) => (new CCommand(x, y, z));

/** An ADT corresponding to the SVG arc-to command. */
class ACommand extends PathCommand {
  accept<T>(visitor: PathCommandVisitor<T>): T {
    return visitor.A(this);
  }
  type: pc.A = pc.A;
  /** The x-radius of this arc-to command. */
  rx: number = 1;
  /** The r-radius of this arc-to command. */
  ry: number = 1;
  rotation: number = 0;
  largeArc: 0 | 1 = 0;
  sweep: 0 | 1 = 0;
  constructor(x: number, y: number, z: number = 1) {
    super(pc.A, vector([x, y, z]));
  }
  rotate(value: number) {
    const out = this.copy();
    out.rotation = value;
    return out;
  }
  yRadius(value: number) {
    const out = this.copy();
    out.ry = value;
    return out;
  }
  xRadius(value: number) {
    const out = this.copy();
    out.rx = value;
    return this;
  }
  swept(value: "clockwise" | "counter-clockwise") {
    const out = this.copy();
    out.sweep = value === "clockwise" ? 1 : 0;
    return out;
  }
  arc(value: "major" | "minor") {
    const out = this.copy();
    out.largeArc = value === "major" ? 1 : 0;
    return out;
  }
  copy(): ACommand {
    const out = new ACommand(this.end.x, this.end.y, this.end.z);
    out.rx = this.rx;
    out.ry = this.ry;
    out.rotation = this.rotation;
    out.largeArc = this.largeArc;
    out.sweep = this.sweep;
    return out;
  }
  endPoint(x: number, y: number, z: number = 1): ACommand {
    return new ACommand(x, y, z);
  }
  toString() {
    return `A${this.rx},${this.ry},${this.rotation},${this.largeArc},${this.sweep},${this.end.x},${this.end.y}`;
  }
}

/** Returns a new arc-to command. */
const A = (x: number, y: number, z: number = 1) => (new ACommand(x, y, z));

class Path {
  /** The SVG commands comprising this path. */
  commands: PathCommand[] = [];
  /** The current endpoint of this path. */
  cursor: Vector;

  /** The origin of this path. */
  origin: Vector;

  tfm(op: (v: Vector) => Vector) {
    this.commands = this.commands.map((p) => {
      const E = op(p.end);
      // deno-fmt-ignore
      switch (p.type) {
        case pc.M: return M(E.x, E.y, E.z);
        case pc.H:
        case pc.L:
        case pc.V: return L(E.x, E.y, E.z);
        case pc.Q: {
          const c = op((p as QCommand).ctrl1);
          return Q(E.x,E.y,E.z).ctrlPoint(c.x,c.y,c.z);
        }
        case pc.C: {
          const c1 = op((p as CCommand).ctrl1);
          const c2 = op((p as CCommand).ctrl2);
          return C(E.x,E.y,E.z)
            .ctrlPoint1(c1.x,c1.y,c1.z)
            .ctrlPoint2(c2.x,c2.y,c2.z);
        }
        case pc.A: {
          p = p as ACommand;
          return A(E.x,E.y,E.z)
        }
        default:
          return p;
      }
    });
    return this;
  }

  rotateZ(angle: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [cos(angle), sin(angle), 0],
        [-sin(angle), cos(angle), 0],
        [0, 0, 1],
      ]))
    );
  }

  rotateY(angle: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [cos(angle), 0, -sin(angle)],
        [0, 1, 0],
        [sin(angle), 0, cos(angle)],
      ]))
    );
  }

  rotateX(angle: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, 0],
        [0, cos(angle), -sin(angle)],
        [0, sin(angle), cos(angle)],
      ]))
    );
  }

  scale(x: number, y: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [x, 0, 0],
        [0, y, 0],
        [0, 0, 1],
      ]))
    );
  }

  translateZ(z: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, 1],
        [0, 1, 1],
        [0, 0, z],
      ]))
    );
  }

  translateY(y: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, 1],
        [0, 1, y],
        [0, 0, 1],
      ]))
    );
  }

  translateX(x: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, x],
        [0, 1, 1],
        [0, 0, 1],
      ]))
    );
  }

  /** Shears along the z-axis. */
  shearZ(dx: number, dy: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, 0],
        [0, 1, 0],
        [dx, dy, 1],
      ]))
    );
  }

  /** Shears along the y-axis. */
  shearY(dx: number, dz: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, 0],
        [dx, 1, dz],
        [0, 0, 1],
      ]))
    );
  }

  /** Shears along the x-axis. */
  shearX(dy: number, dz: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, dy, dz],
        [0, 1, 0],
        [0, 0, 1],
      ]))
    );
  }

  translate(x: number, y: number) {
    return this.tfm((v) =>
      v.vxm(matrix([
        [1, 0, x],
        [0, 1, y],
        [0, 0, 1],
      ]))
    );
  }

  constructor(x: number, y: number, z: number = 1) {
    this.origin = vector([0, 0, 0]);
    this.cursor = vector([x, y, z]);
    this.commands = [M(x, y, z)];
  }

  /** Appends the provided list of commands to this Path’s command list. */
  with(commands: PathCommand[]) {
    commands.forEach((c) => this.commands.push(c));
    return this;
  }

  /** Sets the origin of this path. */
  at(x: number, y: number, z: number = 1) {
    this.origin = vector([x, y, z]);
    return this;
  }

  /** Returns the `d` attribute value resulting from this path. */
  toString(): string {
    const origin = M(this.origin.x, this.origin.y).toString();
    const out = this.commands.map((command) => command.toString());
    return origin + out.join("") + "Z";
  }

  push(command: PathCommand) {
    this.commands.push(command);
    this.cursor = command.end;
    return this;
  }

  /** @param end - The arc’s end point. @param dimensions - Either a pair `(w,h)` where `w` is the width of the arc, and `h` is the height of the arc, or a number. If a number is passed, draws an arc where `w = h` (a circular arc). Defaults to `[1,1]`. @param rotation - The arc’s rotation along its x-axis. If a string is passed, Weave’s parsers will attempt to parse an angle, defaulting to 0 in failure. If a number is passed, assumes the angle unit is in radians. Defaults to `0`. @param arc - Either `minor` (the smaller half of the arc, corresponding to a large arc flag of `0`) or `major` (the larger half of the arc, corresponding to a large arc flag of `1`). Defaults to `minor`. @param sweep - Either `clockwise` (thus drawing the arc clockwise, a sweep flag of 1) or `counter-clockwise` ( thus drawing the arc counter-clockwise, a sweep flag of 0). Defaults to `clockwise`. */
  A(
    end: number[],
    dimensions: number[] | number = [1, 1],
    arc: "minor" | "major" = "minor",
    rotation: number = 0,
    sweep: "clockwise" | "counter-clockwise" = "clockwise",
  ) {
    const [RX, RY] = Array.isArray(dimensions)
      ? dimensions
      : [dimensions, dimensions];
    const x = $isNothing(end[0]) ? end[0] : 0;
    const y = $isNothing(end[1]) ? end[1] : 0;
    const z = $isNothing(end[2]) ? end[2] : 0;
    const a = A(x, y, z)
      .xRadius(RX)
      .yRadius(RY)
      .rotate(rotation)
      .arc(arc)
      .swept(sweep);
    return this.push(a);
  }

  /** Appends a `V` command to this path. */
  V(y: number) {
    return this.push(L(this.cursor.x, y));
  }

  /** Appends an `H` command to this path. */
  H(x: number) {
    return this.push(L(x, this.cursor.y));
  }

  /** Appends an `M` command to this path. */
  M(x: number, y: number, z: number = 1) {
    return this.push(M(x, y, z));
  }

  /** Appends an `L` command to this path. */
  L(x: number, y: number, z: number = 1) {
    return this.push(L(x, y, z));
  }
}

/** Returns a new path. */
export function path(originX: number, originY: number, originZ: number = 1) {
  return (
    new Path(originX, originY, originZ)
  );
}

/** Returns a new line. */
export function line(start: [number, number], end: [number, number]) {
  return path(start[0], start[1]).L(end[0], end[1]);
}

class Quad {
  _width: number;
  _height: number;
  origin: Vector = vector([0, 0, 1]);
  constructor(width: number, height: number) {
    this._width = width;
    this._height = height;
  }
  get path() {
    const x = this.origin.x;
    const y = this.origin.y;
    return [
      line([x, y], [x + this._width, y]),
      line([x + this._width, y], [x + this._width, y + this._height]),
      line([x + this._width, y + this._height], [x, y + this._height]),
      line([x, y + this._height], [x, y]),
    ];
  }
  toString() {
    return this.path.map((c) => c.toString()).join("");
  }
  at(x: number, y: number, z: number = 1) {
    this.origin = vector([x, y, z]);
  }
}

export function quad(width: number, height: number) {
  return new Quad(width, height);
}

type Renderable = Path | Quad;

export class Group {
  children: (Renderable)[];
  ctx: Context = ctx(500, 500);
  constructor(children: (Renderable)[]) {
    this.children = children;
  }

  context(context: Context) {
    this.ctx = context;
    return this;
  }

  map(op: (c: Path) => Path) {
    const cs = [];
    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child instanceof Path) {
        cs.push(op(child));
      }
      if (child instanceof Quad) {
        child.path.forEach((c) => {
          cs.push(op(c));
        });
      }
    }
    this.children = cs;
    return this;
  }

  shearZ(dx: number, dy: number) {
    return this.map((c) => c.shearZ(dx, dy));
  }

  shearY(dx: number, dz: number) {
    return this.map((c) => c.shearY(dx, dz));
  }

  shearX(dy: number, dz: number) {
    return this.map((c) => c.shearX(dy, dz));
  }

  translateZ(z: number) {
    return this.map((c) => c.translateZ(z));
  }

  translateY(y: number) {
    return this.map((c) => c.translateY(y));
  }

  translateX(x: number) {
    return this.map((c) => c.translateX(x));
  }

  translate(x: number, y: number) {
    return this.map((c) => c.translate(x, y));
  }

  rotateZ(angle: number) {
    return this.map((c) => c.rotateZ(angle));
  }

  rotateY(angle: number) {
    return this.map((c) => c.rotateY(angle));
  }

  rotateX(angle: number) {
    return this.map((c) => c.rotateX(angle));
  }

  scale(x: number, y: number) {
    return this.map((c) => c.scale(x, y));
  }

  render() {
    return this.children.map((n) => n.toString()).join("");
  }
}

export function group(children: (Renderable)[]) {
  return new Group(children);
}

class BigRat {
  N: bigint;
  D: bigint;
  constructor(N: bigint, D: bigint) {
    this.N = N;
    this.D = D;
  }
  get isZero() {
    return this.N !== 0n;
  }
  toString() {
    return `#${this.N}|${this.D}`;
  }
}

function bigRat(N: bigint, D: bigint) {
  return new BigRat(N, D);
}

const $isFraction = (
  value: any,
): value is Fraction => (value instanceof Fraction);

function ratio(n: number, d: number) {
  return new Fraction(n, d);
}

function arrayString<T extends any>(array: T[]): string {
  const out = [];
  for (let i = 0; i < array.length; i++) {
    const element = array[i];
    const index = `[${i}]\n`;
    out.push(index);
    if ($isArray(element)) {
      const es = arrayString(element);
      out.push(es);
    } else if ($isObject(element)) {
      const objstr = objectTree(element);
      out.push(objstr);
    } else if ($isFunction(element)) {
      const f = `${element.name}`;
      out.push(`𝑓 ${f}`);
    } else {
      out.push(`${element}`);
    }
    out.push(`\n`);
  }
  return out.join("");
}

/**
 * Utility function for printing the AST.
 */
function objectTree<T extends Object>(
  Obj: T,
  initial: string = ".",
  cbfn?: (node: any) => void,
): string {
  const prefix = (key: keyof T, last: boolean) => {
    let str = last ? "└" : "├";
    if (key) str += "─ ";
    else str += "──┐";
    return str;
  };
  const getKeys = (obj: T) => {
    const keys: (keyof T)[] = [];
    for (const branch in obj) {
      if (!obj.hasOwnProperty(branch) || typeof obj[branch] === "function") {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  };
  const grow = (
    key: keyof T,
    root: any,
    last: boolean,
    prevstack: ([T, boolean])[],
    cb: (str: string) => any,
  ) => {
    cbfn && cbfn(root);
    let line = "";
    let index = 0;
    let lastKey = false;
    let circ = false;
    let stack = prevstack.slice(0);
    if (stack.push([root, last]) && stack.length > 0) {
      prevstack.forEach(function (lastState, idx) {
        if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
        if (!circ && lastState[0] === root) circ = true;
      });
      line += prefix(key, last) + key.toString();
      if (typeof root !== "object") line += ": " + root;
      circ && (line += " (circular ref.)");
      cb(line);
    }
    if (root instanceof Expr || root instanceof Statement) {
      // @ts-ignore
      root["node"] = nodekind[root.kind];
    }
    if (!circ && typeof root === "object") {
      const keys = getKeys(root);
      keys.forEach((branch) => {
        lastKey = ++index === keys.length;
        grow(branch, root[branch], lastKey, stack, cb);
      });
    }
  };
  let output = "";
  const obj = Object.assign({}, Obj);
  if (Obj instanceof Statement) {
    // @ts-ignore
    initial = nodekind[Obj.kind];
  }
  grow(
    initial as keyof T,
    obj,
    false,
    [],
    (line: string) => (output += line + "\n"),
  );
  return output;
}

/** At the parsing stage, all parsed node results are kept in an `Either` type (either an AST node) or an Err (error) object. We want to avoid throwing as much as possible for optimal parsing. */
type Either<A, B> = Left<A> | Right<B>;

/** A box type corresponding to failure. */
class Left<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<A>(f: (x: never) => A): Either<T, never> {
    return this as any;
  }
  isLeft(): this is Left<T> {
    return true;
  }
  isRight(): this is never {
    return false;
  }
  chain<X, S>(f: (x: never) => Either<X, S>): Left<T> {
    return this;
  }
  read<K>(value: K): K {
    return value;
  }
  flatten(): Left<T> {
    return this;
  }
  unwrap() {
    return this.value;
  }
  ap<B, E>(f: Either<T, E>): Either<never, B> {
    return this as any;
  }
}

/** A box type corresponding success. */
class Right<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<X>(f: (x: T) => X): Either<never, X> {
    return new Right(f(this.value));
  }
  isLeft(): this is never {
    return false;
  }
  isRight(): this is Right<T> {
    return true;
  }
  chain<N, X>(f: (x: T) => Either<N, X>): Either<never, X> {
    return f(this.value) as Either<never, X>;
  }
  flatten(): Right<(T extends Right<(infer T)> ? T : never)> {
    return ((this.value instanceof Right ||
        this.value instanceof Left)
      ? this.value
      : this) as Right<(T extends Right<(infer T)> ? T : never)>;
  }
  read<K>(_: K): T {
    return this.value;
  }
  unwrap() {
    return this.value;
  }
  ap<B, E>(f: Either<E, (x: T) => B>): Either<never, B> {
    if (f.isLeft()) return f as any as Right<B>;
    return this.map(f.value);
  }
}

/** Returns a new left. */
const left = <T>(x: T): Left<T> => new Left(x);

/** Returns a new right. */
const right = <T>(x: T): Right<T> => new Right(x);

type ErrorType =
  | "lexical-error"
  | "syntax-error"
  | "type-error"
  | "runtime-error"
  | "resolver-error"
  | "environment-error"
  | "algebraic-error";

/** An object containing an error report. */
class Err extends Error {
  message: string;
  errorType: ErrorType;
  phase: string;
  location: Location;
  recommendation: string;
  constructor(
    message: string,
    errorType: ErrorType,
    phase: string,
    line: number,
    column: number,
    recommendation: string = "none",
  ) {
    super(message);
    this.errorType = errorType;
    this.phase = phase;
    this.location = { line, column };
    this.message = message;
    this.recommendation = recommendation;
  }
  report() {
    return formattedError(
      this.message,
      this.phase,
      this.errorType,
      this.location.line,
      this.location.column,
      this.recommendation,
    );
  }
}

/** Ensures all errors have the same format. */
function formattedError(
  message: string,
  phase: string,
  errorType: ErrorType,
  line: number,
  column: number,
  recommendation: string,
) {
  let moduleName = "module";
  switch (errorType) {
    case "lexical-error":
      moduleName = "scanner";
      break;
    case "algebraic-error":
      moduleName = "algebraic tree transfomer";
      break;
    case "environment-error":
      moduleName = "environment";
      break;
    case "resolver-error":
      moduleName = "resolver";
      break;
    case "runtime-error":
      moduleName = "interpreter";
      break;
    case "syntax-error":
      moduleName = "parser";
      break;
    case "type-error":
      moduleName = "typechecker";
  }
  return (`${errorType.toUpperCase()}.\nWhile ${phase}, an error occurred on\nline ${line}, column ${column}.\nReporting from the ${moduleName}:\n${message} \nRecommendation: ${recommendation}`);
}

/** Returns a new lexical error. A lexical error is raised if an error occured during scanning. */
function lexicalError(
  message: string,
  phase: string,
  token: Token,
) {
  return new Err(message, "lexical-error", phase, token.L, token.C);
}

/** Returns a new syntax error. A syntax error is raised if an error occured during parsing. */
function syntaxError(
  message: string,
  phase: string,
  token: Token,
) {
  return new Err(message, "syntax-error", phase, token.L, token.C);
}

/** Returns a new runtime error. A runtime error is raised if an error occured during interpretation. */
function runtimeError(
  message: string,
  phase: string,
  token: Token,
  rec: string = "none",
) {
  return new Err(message, "runtime-error", phase, token.L, token.C, rec);
}

/** Returns a new type error. A type error is raised if an error occurred during type-checking. */
function typeError(
  message: string,
  phase: string,
  token: Token,
) {
  return new Err(message, "type-error", phase, token.L, token.C);
}

/** Returns a new environment error. An environment error is raised if an error occured during an environment lookup. */
function envError(
  message: string,
  phase: string,
  token: Token,
  rec: string,
) {
  return new Err(message, "environment-error", phase, token.L, token.C, rec);
}

/** Returns a new resolver error. A resolver error is raised if an error occured during resolution. */
function resolverError(
  message: string,
  phase: string,
  token: Token,
) {
  return new Err(message, "resolver-error", phase, token.L, token.C);
}

/** Returns a new algebra error. An algebra error is raised if an error occured during a symbolic operation. Because symbolic operations are handled by the symbol engine, these errors must be handled separately. */
function algebraError(
  message: string,
  phase: string,
  token: Token,
) {
  return new Err(message, "algebraic-error", phase, token.L, token.C);
}

enum nodekind {
  class_statement,
  block_statement,
  string_binex,
  grouped_expression,
  expression_statement,
  function_declaration,
  branching_statement,
  print_statement,
  return_statement,
  variable_declaration,
  vector_binex,
  loop_statement,
  algebra_string,
  tuple_expression,
  vector_expression,
  matrix_expression,
  assignment_expression,
  native_call,
  algebraic_unary,
  algebraic_infix,
  logical_unary,
  call,
  nil,
  fraction_expression,
  numeric_constant,
  integer,
  float,
  bool,
  string,
  symbol,
  logical_infix,
  let_expression,
  get_expression,
  set_expression,
  super_expression,
  this_expression,
  relation,
  indexing_expression,
  big_number,
  big_rational,
}

interface Visitor<T> {
  integer(node: Integer): T;
  numericConstant(node: NumericConstant): T;
  vectorExpr(node: VectorExpr): T;
  vectorBinaryExpr(node: VectorBinaryExpr): T;
  matrixExpr(node: MatrixExpr): T;
  indexingExpr(node: IndexingExpr): T;
  bigNumber(node: BigNumber): T;
  fractionExpr(node: FractionExpr): T;
  bigRational(node: RationalExpr): T;
  float(node: Float): T;
  bool(node: Bool): T;
  tupleExpr(node: TupleExpr): T;
  getExpr(node: GetExpr): T;
  setExpr(node: SetExpr): T;
  superExpr(node: SuperExpr): T;
  thisExpr(node: ThisExpr): T;
  string(node: StringLiteral): T;
  stringBinaryExpr(node: StringBinaryExpr): T;
  algebraicString(node: AlgebraicString): T;
  nil(node: Nil): T;
  variable(node: Variable): T;
  assignExpr(node: AssignExpr): T;
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): T;
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): T;
  logicalBinaryExpr(node: LogicalBinaryExpr): T;
  logicalUnaryExpr(node: LogicalUnaryExpr): T;
  relationalExpr(node: RelationalExpr): T;
  callExpr(node: CallExpr): T;
  nativeCall(node: NativeCall): T;
  groupExpr(node: GroupExpr): T;
  blockStmt(node: BlockStmt): T;
  exprStmt(node: ExprStmt): T;
  fnStmt(node: FnStmt): T;
  ifStmt(node: IfStmt): T;
  classStmt(node: ClassStmt): T;
  printStmt(node: PrintStmt): T;
  returnStmt(node: ReturnStmt): T;
  letStmt(node: VariableStmt): T;
  whileStmt(node: WhileStmt): T;
}

abstract class TREENODE {
  abstract get kind(): nodekind;
}

abstract class ASTNode extends TREENODE {
  abstract accept<T>(visitor: Visitor<T>): T;
  abstract toString(): string;
  abstract isStatement(): this is Statement;
  abstract isExpr(): this is Expr;
}

abstract class Statement extends ASTNode {
  isStatement(): this is Statement {
    return true;
  }
  isExpr(): this is Expr {
    return false;
  }
  toString(): string {
    return "";
  }
}

class ClassStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.classStmt(this);
  }

  get kind(): nodekind {
    return nodekind.class_statement;
  }
  name: Token;
  methods: FnStmt[];
  constructor(name: Token, methods: FnStmt[]) {
    super();
    this.name = name;
    this.methods = methods;
  }
}

function classStmt(name: Token, methods: FnStmt[]) {
  return new ClassStmt(name, methods);
}

class BlockStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.blockStmt(this);
  }

  get kind(): nodekind {
    return nodekind.block_statement;
  }
  statements: Statement[];
  constructor(statements: Statement[]) {
    super();
    this.statements = statements;
  }
}

function isBlock(node: ASTNode): node is BlockStmt {
  return node.kind === nodekind.block_statement;
}

function block(statements: Statement[]) {
  return new BlockStmt(statements);
}

class ExprStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.exprStmt(this);
  }

  get kind(): nodekind {
    return nodekind.expression_statement;
  }
  expression: Expr;
  line: number;
  constructor(expression: Expr, line: number) {
    super();
    this.expression = expression;
    this.line = line;
  }
}

function exprStmt(expression: Expr, line: number) {
  return new ExprStmt(expression, line);
}

class FnStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fnStmt(this);
  }

  get kind(): nodekind {
    return nodekind.function_declaration;
  }
  name: Token<tt.symbol>;
  params: Variable[];
  body: Statement[];
  constructor(
    name: Token<tt.symbol>,
    params: Token<tt.symbol>[],
    body: Statement[],
  ) {
    super();
    this.name = name;
    this.params = params.map((p) => variable(p));
    this.body = body;
  }
}

/**
 * Returns a new {@link FnStmt|function declaration statement}.
 */
function functionStmt(
  name: Token<tt.symbol>,
  params: Token<tt.symbol>[],
  body: Statement[],
) {
  return new FnStmt(name, params, body);
}

class IfStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ifStmt(this);
  }

  get kind(): nodekind {
    return nodekind.branching_statement;
  }
  keyword: Token;
  condition: Expr;
  then: Statement;
  alt: Statement;
  constructor(
    keyword: Token,
    condition: Expr,
    then: Statement,
    alt: Statement,
  ) {
    super();
    this.keyword = keyword;
    this.condition = condition;
    this.then = then;
    this.alt = alt;
  }
}

/**
 * Returns a new {@link IfStmt|if-statement}.
 */
function ifStmt(
  keyword: Token,
  condition: Expr,
  then: Statement,
  alt: Statement,
) {
  return new IfStmt(keyword, condition, then, alt);
}

class PrintStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.printStmt(this);
  }

  get kind(): nodekind {
    return nodekind.print_statement;
  }
  keyword: Token;
  expression: Expr;
  constructor(keyword: Token, expression: Expr) {
    super();
    this.expression = expression;
    this.keyword = keyword;
  }
}

/**
 * Returns a new {@link PrintStmt|print-statement}.
 */
function printStmt(keyword: Token, expression: Expr) {
  return new PrintStmt(keyword, expression);
}

class ReturnStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.returnStmt(this);
  }

  get kind(): nodekind {
    return nodekind.return_statement;
  }
  value: Expr;
  keyword: Token;
  constructor(value: Expr, keyword: Token) {
    super();
    this.value = value;
    this.keyword = keyword;
  }
}

/**
 * Returns a new {@link ReturnStmt|return-statement}.
 */
function returnStmt(value: Expr, keyword: Token) {
  return new ReturnStmt(value, keyword);
}

class VariableStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.letStmt(this);
  }

  get kind(): nodekind {
    return nodekind.variable_declaration;
  }
  variable: Variable;
  value: Expr;
  mutable: boolean;
  constructor(name: Token<tt.symbol>, value: Expr, mutable: boolean) {
    super();
    this.variable = variable(name);
    this.value = value;
    this.mutable = mutable;
  }
  get name() {
    return this.variable.name;
  }
}

function varStmt(name: Token<tt.symbol>, value: Expr) {
  return new VariableStmt(name, value, true);
}

function letStmt(name: Token<tt.symbol>, value: Expr) {
  return new VariableStmt(name, value, false);
}

class WhileStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.whileStmt(this);
  }

  get kind(): nodekind {
    return nodekind.loop_statement;
  }
  keyword: Token;
  condition: Expr;
  body: Statement;
  constructor(keyword: Token, condition: Expr, body: Statement) {
    super();
    this.keyword = keyword;
    this.condition = condition;
    this.body = body;
  }
}

/**
 * Returns a new {@link WhileStmt|while-statement}.
 */
function whileStmt(keyword: Token, condition: Expr, body: Statement) {
  return new WhileStmt(keyword, condition, body);
}

abstract class Expr extends ASTNode {
  isStatement(): this is Statement {
    return false;
  }
  isExpr(): this is Expr {
    return true;
  }
}

class IndexingExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.indexingExpr(this);
  }

  toString(): string {
    return "";
  }
  get kind(): nodekind {
    return nodekind.indexing_expression;
  }
  op: Token;
  list: Expr;
  index: Expr;
  constructor(list: Expr, index: Expr, op: Token) {
    super();
    this.list = list;
    this.index = index;
    this.op = op;
  }
}

function indexingExpr(list: Expr, index: Expr, op: Token) {
  return new IndexingExpr(list, index, op);
}

class AlgebraicString extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicString(this);
  }

  toString(): string {
    return "";
  }
  get kind(): nodekind {
    return nodekind.algebra_string;
  }
  expression: Expr;
  op: Token;
  constructor(expression: Expr, op: Token) {
    super();
    this.expression = expression;
    this.op = op;
  }
}

function algebraicString(expression: Expr, op: Token) {
  return new AlgebraicString(expression, op);
}

/**
 * __Typeguard__. Returns true if the given `node` is an expression,
 * false otherwise.
 */
function isExpr(node: ASTNode): node is Expr {
  return node instanceof Expr;
}

class TupleExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tupleExpr(this);
  }

  get kind(): nodekind {
    return nodekind.tuple_expression;
  }
  elements: Expr[];
  constructor(elements: Expr[]) {
    super();
    this.elements = elements;
  }
  toString(): string {
    const elements = this.elements.map((e) => e.toString()).join(",");
    return `(${elements})`;
  }
}

class VectorExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vectorExpr(this);
  }

  get kind(): nodekind {
    return nodekind.vector_expression;
  }
  op: Token;
  elements: Expr[];
  constructor(elements: Expr[], op: Token) {
    super();
    this.elements = elements;
    this.op = op;
  }
  toString(): string {
    const elements = this.elements.map((e) => e.toString()).join(",");
    return `[${elements}]`;
  }
}

/**
 * Returns a new {@link VectorExpr|vector expression}.
 */
function vectorExpr(elements: Expr[], op: Token) {
  return new VectorExpr(elements, op);
}

/**
 * __Typeguarde__. Returns true if the given `node`
 * is a {@link VectorExpr|vector expression}, false otherwise.
 */
function isVectorExpr(node: ASTNode): node is VectorExpr {
  return node.kind === nodekind.vector_expression;
}

class MatrixExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.matrixExpr(this);
  }

  toString(): string {
    const vectors = this.vectors.map((v) => v.toString()).join(",");
    return `[${vectors}]`;
  }
  get kind(): nodekind {
    return nodekind.matrix_expression;
  }
  vectors: Expr[];
  rows: number;
  cols: number;
  constructor(
    vectors: Expr[],
    rows: number,
    columns: number,
  ) {
    super();
    this.vectors = vectors;
    this.rows = rows;
    this.cols = columns;
  }
}

function matrixExpr(vectors: Expr[], rows: number, columns: number) {
  return new MatrixExpr(vectors, rows, columns);
}

/**
 * Returns a new {@link TupleExpr|tuple expression}.
 */
function tupleExpr(elements: Expr[]) {
  return new TupleExpr(elements);
}
class BigNumber extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bigNumber(this);
  }

  toString(): string {
    return `#${this.value}`;
  }
  get kind(): nodekind {
    return nodekind.big_number;
  }
  value: bigint;
  constructor(value: bigint) {
    super();
    this.value = value;
  }
}

/**
 * Returns a new {@link BigNumber}.
 */
function bigNumber(value: bigint) {
  return new BigNumber(value);
}

class RationalExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bigRational(this);
  }

  toString(): string {
    return this.value.toString();
  }
  get kind(): nodekind {
    return nodekind.big_rational;
  }
  value: BigRat;
  constructor(N: bigint, D: bigint) {
    super();
    this.value = bigRat(N, D);
  }
}

function bigRational(N: bigint, D: bigint) {
  return new RationalExpr(N, D);
}

class AssignExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assignExpr(this);
  }

  toString(): string {
    return `${this.name} = ${this.value.toString()}`;
  }
  get kind(): nodekind {
    return nodekind.assignment_expression;
  }
  variable: Variable;
  value: Expr;
  constructor(variable: Variable, value: Expr) {
    super();
    this.variable = variable;
    this.value = value;
  }
  get name() {
    return this.variable.name;
  }
}

type NativeUnary =
  | "ceil"
  | "floor"
  | "sin"
  | "cos"
  | "cosh"
  | "tan"
  | "lg"
  | "ln"
  | "!"
  | "log"
  | "arcsin"
  | "arccos"
  | "arcsinh"
  | "arctan"
  | "exp"
  | "sinh"
  | "sqrt"
  | "tanh"
  | "gcd"
  | "avg"
  | "deriv"
  | "simplify"
  | "subex"
  | "arccosh";

/**
 * A native function that takes more than 1 argument.
 */
type NativePolyAry = "max" | "min";

type NativeFn = NativeUnary | NativePolyAry;

class NativeCall extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nativeCall(this);
  }

  toString(): string {
    return `${this.name}(${this.args.map((x) => x.toString()).join(",")})`;
  }
  get kind(): nodekind {
    return nodekind.native_call;
  }
  name: Token<tt.native, string, NativeFn>;
  args: Expr[];
  constructor(
    name: Token<tt.native, string, NativeFn>,
    args: Expr[],
  ) {
    super();
    this.name = name;
    this.args = args;
  }
}

/**
 * Returns a new {@link NativeCall|native call function}.
 */
function nativeCall(
  name: Token<tt.native, string, NativeFn>,
  args: Expr[],
) {
  return new NativeCall(name, args);
}

/**
 * Returns a new {@link AssignExpr|assignment expression}.
 */
function assign(name: Variable, value: Expr) {
  return new AssignExpr(name, value);
}

type AlgebraicUnaryOperator =
  | tt.plus
  | tt.minus
  | tt.bang;

class AlgebraicUnaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicUnaryExpr(this);
  }

  toString(): string {
    return `${this.op.lexeme}${this.arg.toString()}`;
  }
  get kind(): nodekind {
    return nodekind.algebraic_unary;
  }
  op: Token<AlgebraicUnaryOperator>;
  arg: Expr;
  constructor(op: Token<AlgebraicUnaryOperator>, arg: Expr) {
    super();
    this.op = op;
    this.arg = arg;
  }
}

/**
 * Returns a new algebraic unary expression.
 */
function algebraicUnary(op: Token<AlgebraicUnaryOperator>, arg: Expr) {
  return new AlgebraicUnaryExpr(op, arg);
}

type LogicalUnaryOperator = tt.not;

class LogicalUnaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicalUnaryExpr(this);
  }

  toString(): string {
    return `${this.op.lexeme}(${this.arg.toString()})`;
  }
  get kind(): nodekind {
    return nodekind.logical_unary;
  }
  op: Token<LogicalUnaryOperator>;
  arg: Expr;
  constructor(op: Token<LogicalUnaryOperator>, arg: Expr) {
    super();
    this.op = op;
    this.arg = arg;
  }
}

/**
 * Returns a new {@link LogicalUnaryExpr|logical unary expression}.
 */
function logicalUnary(op: Token<LogicalUnaryOperator>, arg: Expr) {
  return new LogicalUnaryExpr(op, arg);
}

type StringBinop = tt.amp;
class StringBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.stringBinaryExpr(this);
  }
  toString(): string {
    const left = this.left.toString();
    const op = this.op.lexeme;
    const right = this.right.toString();
    return `${left} ${op} ${right}`;
  }
  get kind(): nodekind {
    return nodekind.string_binex;
  }
  left: Expr;
  op: Token<StringBinop>;
  right: Expr;
  constructor(left: Expr, op: Token<StringBinop>, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}
const stringBinex = (left: Expr, op: Token<StringBinop>, right: Expr) => (
  new StringBinaryExpr(left, op, right)
);

type VectorBinaryOP = tt.dot_add | tt.dot_minus | tt.dot_star | tt.dot_caret;
class VectorBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vectorBinaryExpr(this);
  }
  toString(): string {
    const left = this.left.toString();
    const op = this.op.lexeme;
    const right = this.right.toString();
    return `${left} ${op} ${right}`;
  }
  get kind(): nodekind {
    return nodekind.vector_binex;
  }
  left: Expr;
  op: Token<VectorBinaryOP>;
  right: Expr;
  constructor(left: Expr, op: Token<VectorBinaryOP>, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

const vectorBinaryExpr = (
  left: Expr,
  op: Token<VectorBinaryOP>,
  right: Expr,
) => (
  new VectorBinaryExpr(left, op, right)
);

type ArithmeticOperator =
  | tt.plus
  | tt.star
  | tt.caret
  | tt.slash
  | tt.minus
  | tt.rem
  | tt.mod
  | tt.percent
  | tt.div;

class AlgebraicBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicBinaryExpr(this);
  }

  get kind(): nodekind {
    return nodekind.algebraic_infix;
  }
  left: Expr;
  op: Token<ArithmeticOperator>;
  right: Expr;
  toString(): string {
    const left = this.left.toString();
    const right = this.right.toString();
    switch (this.op.type) {
      case tt.plus:
        return `${left} + ${right}`;
      case tt.star: {
        if (
          isLatinGreek(right) || isMathSymbol(right) && isNumericString(left)
        ) {
          return `${left}${right}`;
        } else {
          return `${left} * ${right}`;
        }
      }
      case tt.caret:
        return `${left}^${right}`;
      case tt.slash:
        return `${left}/${right}`;
      case tt.minus:
        return `${left} - ${right}`;
      case tt.rem:
        return `${left} rem ${right}`;
      case tt.mod:
        return `${left} mod ${right}`;
      case tt.percent:
        return `${left}% ${right}`;
      case tt.div:
        return `${left} div ${right}`;
    }
  }
  constructor(left: Expr, op: Token<ArithmeticOperator>, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/**
 * Returns a new {@link AlgebraicBinaryExpr|binary expression}.
 */
function binex(left: Expr, op: Token<ArithmeticOperator>, right: Expr) {
  return new AlgebraicBinaryExpr(left, op, right);
}

class CallExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.callExpr(this);
  }

  toString(): string {
    const f = this.callee.toString();
    const args = this.args.map((x) => x.toString()).join(",");
    return `${f}(${args})`;
  }
  get kind(): nodekind {
    return nodekind.call;
  }
  callee: Expr;
  paren: Token;
  args: Expr[];
  constructor(callee: Expr, args: Expr[], paren: Token) {
    super();
    this.callee = callee;
    this.args = args;
    this.paren = paren;
  }
}

/**
 * Returns a new {@link CallExpr|call expression}.
 */
function call(callee: Expr, args: Expr[], paren: Token) {
  return new CallExpr(callee, args, paren);
}

class GroupExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.groupExpr(this);
  }

  toString(): string {
    return `(${this.expression.toString()})`;
  }
  get kind(): nodekind {
    return nodekind.grouped_expression;
  }
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
}
const isGroupExpr = (node: ASTNode): node is GroupExpr => (
  node.kind === nodekind.grouped_expression
);

/**
 * Returns a new {@link GroupExpr|group expression}.
 */
function grouped(expression: Expr) {
  return new GroupExpr(expression);
}

class Nil extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }

  toString(): string {
    return `nil`;
  }
  get kind(): nodekind {
    return nodekind.nil;
  }
  value: null;
  constructor() {
    super();
    this.value = null;
  }
}

function nil() {
  return new Nil();
}

class FractionExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fractionExpr(this);
  }

  toString(): string {
    return this.value.toString();
  }
  get kind(): nodekind {
    return nodekind.fraction_expression;
  }
  value: Fraction;
  constructor(n: number, d: number) {
    super();
    this.value = ratio(n, d);
  }
}

function rational(n: number, d: number) {
  return new FractionExpr(n, d);
}

type CoreConstant = "NAN" | "Inf" | "pi" | "e";

class NumericConstant extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.numericConstant(this);
  }

  toString(): string {
    return `${this.sym}`;
  }
  get kind(): nodekind {
    return nodekind.numeric_constant;
  }
  value: number;
  sym: CoreConstant;
  constructor(value: number, sym: CoreConstant) {
    super();
    this.value = value;
    this.sym = sym;
  }
}

function numericConstant(value: number, sym: CoreConstant) {
  return new NumericConstant(value, sym);
}

class Integer extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.integer(this);
  }
  toString(): string {
    return `${this.value}`;
  }
  get kind(): nodekind {
    return nodekind.integer;
  }
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

/** Returns a new {@link Integer|integer node}. */
function integer(n: number) {
  return new Integer(n);
}

class Float extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.float(this);
  }
  toString(): string {
    return `${this.value}`;
  }
  get kind(): nodekind {
    return nodekind.float;
  }
  value: number;
  constructor(value: number) {
    super();
    this.value = value;
  }
}

/** Returns a new {@link Float|float node}. */
function float(n: number) {
  return new Float(n);
}

class Bool extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }

  toString(): string {
    return `${this.value}`;
  }
  get kind(): nodekind {
    return nodekind.bool;
  }
  value: boolean;
  constructor(value: boolean) {
    super();
    this.value = value;
  }
}

/** Returns a new {@link Bool|boolean node}. */
function bool(value: boolean) {
  return new Bool(value);
}

class StringLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.string(this);
  }

  toString(): string {
    return this.value;
  }
  get kind(): nodekind {
    return nodekind.string;
  }
  value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
}

/** Returns a new {@link StringLiteral|string literal node}. */
function string(value: string) {
  return new StringLiteral(value);
}

class Variable extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.variable(this);
  }

  toString(): string {
    return this.name.lexeme;
  }
  get kind(): nodekind {
    return nodekind.symbol;
  }
  name: Token<tt.symbol>;
  constructor(name: Token<tt.symbol>) {
    super();
    this.name = name;
  }
}

function isVariable(node: ASTNode): node is Variable {
  return node.kind === nodekind.symbol;
}

/** Returns a new {@link Variable|variable node}. */
function variable(name: Token<tt.symbol>) {
  return new Variable(name);
}

type BinaryLogicalOperator =
  | tt.and
  | tt.nand
  | tt.nor
  | tt.xnor
  | tt.xor
  | tt.or;

class LogicalBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicalBinaryExpr(this);
  }

  toString(): string {
    const left = this.left.toString();
    const right = this.right.toString();
    return `${left} ${this.op.lexeme} ${right}`;
  }
  get kind(): nodekind {
    return nodekind.logical_infix;
  }
  left: Expr;
  op: Token<BinaryLogicalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BinaryLogicalOperator>, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/** Returns a new {@link LogicalBinaryExpr|logical binary expression}. */
function logicalBinex(
  left: Expr,
  op: Token<BinaryLogicalOperator>,
  right: Expr,
) {
  return new LogicalBinaryExpr(left, op, right);
}

type RelationalOperator = tt.lt | tt.gt | tt.deq | tt.neq | tt.geq | tt.leq;

class GetExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.getExpr(this);
  }

  toString(): string {
    return ``;
  }
  get kind(): nodekind {
    return nodekind.get_expression;
  }
  object: Expr;
  name: Token;
  constructor(object: Expr, name: Token, loc: Location) {
    super();
    this.object = object;
    this.name = name;
  }
}

function isGetExpr(node: ASTNode): node is GetExpr {
  return node.kind === nodekind.get_expression;
}

function getExpr(object: Expr, name: Token, loc: Location) {
  return new GetExpr(object, name, loc);
}

class SetExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.setExpr(this);
  }

  toString(): string {
    return "";
  }
  get kind(): nodekind {
    return nodekind.set_expression;
  }
  object: Expr;
  name: Token;
  value: Expr;
  constructor(object: Expr, name: Token, value: Expr, loc: Location) {
    super();
    this.object = object;
    this.name = name;
    this.value = value;
  }
}

function setExpr(object: Expr, name: Token, value: Expr, loc: Location) {
  return new SetExpr(object, name, value, loc);
}

class SuperExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.superExpr(this);
  }

  toString(): string {
    return "";
  }
  get kind(): nodekind {
    return nodekind.super_expression;
  }
  method: Token;
  loc: Location;
  constructor(method: Token, loc: Location) {
    super();
    this.method = method;
    this.loc = loc;
  }
}

function superExpr(method: Token, loc: Location) {
  return new SuperExpr(method, loc);
}

class ThisExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.thisExpr(this);
  }

  toString(): string {
    return ``;
  }
  get kind(): nodekind {
    return nodekind.this_expression;
  }
  keyword: Token;
  constructor(keyword: Token) {
    super();
    this.keyword = keyword;
  }
}

function thisExpr(keyword: Token) {
  return new ThisExpr(keyword);
}

class RelationalExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relationalExpr(this);
  }

  toString(): string {
    const left = this.left.toString();
    const right = this.right.toString();
    return `${left} ${this.op.lexeme} ${right}`;
  }
  get kind(): nodekind {
    return nodekind.relation;
  }
  left: Expr;
  op: Token<RelationalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<RelationalOperator>, right: Expr) {
    super();
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/** Returns a new relational expression. See also {@link RelationExpr}. */
function relation(left: Expr, op: Token<RelationalOperator>, right: Expr) {
  return new RelationalExpr(left, op, right);
}

/** Utility method - returns a string wherein the given string or number is surrounded in parentheses. */
const parend = (s: string | number) => (
  `(${s})`
);

/** The `core` enum is an enumeration of constant strings that ensures the core operation symbols are consistent throughought the code base. */
enum core {
  int = "int",
  real = "real",
  complex = "complex",
  fraction = "fraction",
  symbol = "symbol",
  constant = "constant",
  sum = "+",
  difference = "-",
  product = "*",
  quotient = "/",
  power = "^",
  factorial = "!",
  undefined = "Undefined",
}

enum klass {
  atom,
  compound,
}

interface ExpressionVisitor<T> {
  int(node: Int): T;
  real(node: Real): T;
  sym(node: Sym): T;
  constant(node: Constant): T;
  sum(node: Sum): T;
  product(node: Product): T;
  quotient(node: Quotient): T;
  fraction(node: Fraction): T;
  power(node: Power): T;
  difference(node: Difference): T;
  factorial(node: Factorial): T;
  algebraicFn(node: AlgebraicFn): T;
}

abstract class AlgebraicExpression {
  abstract accept<T>(visitor: ExpressionVisitor<T>): T;
  /**
   * Returns true if this expression is syntactically
   * equal to the provided expression. Otherwise,
   * returns false.
   */
  abstract equals(other: AlgebraicExpression): boolean;
  abstract get args(): AlgebraicExpression[];
  abstract set args(args: AlgebraicExpression[]);
  /**
   * Returns this expression as a string.
   */
  abstract toString(): string;
  /**
   * Returns a copy of this expression.
   */
  abstract copy(): AlgebraicExpression;
  /**
   * Returns the ith operand of this expression.
   * If this expression is not a compound expression,
   * returns {@link Undefined}.
   */
  abstract operand(i: number): AlgebraicExpression;
  /**
   * Returns the number of operands of this expression.
   * If this expression is not a compound expression,
   * returns 0.
   */
  abstract get numberOfOperands(): number;
  abstract isAlgebraic(): boolean;
  /**
   * This expressions operator.
   */
  readonly op: string;
  /**
   * The parentheses level of this expression.
   */
  parenLevel: number = 0;
  /**
   * Increments the parentheses level of this expression.
   * This method should be called if an expression is
   * surrounded by parentheses.
   */
  tickParen() {
    this.parenLevel += 1;
    return this;
  }

  hasParens() {
    return this.parenLevel !== 0;
  }

  /**
   * Returns true if this expression and the provided
   * expression have the same parentheses level.
   */
  sameParenLevel(other: AlgebraicExpression) {
    return this.parenLevel === other.parenLevel;
  }
  /**
   * This expression’s overarching class. This is
   * an enum value of {@link klass}. Either:
   *
   * 1. `klass.atom` (corresponding to an atomic expression), or
   * 2. `klass.compound` (corresponding to a compound expression).
   */
  klass: klass;
  constructor(op: string, klass: klass) {
    this.op = op;
    this.klass = klass;
  }
}

/** Type predicate. Claims and returns true if the given expression `u` is an atomic expression. False otherwise. See also {@link Atom}. */
function isAtom(u: AlgebraicExpression): u is Atom {
  return u.klass === klass.atom;
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is a {@link Compound|compound expression}. False otherwise.
 */
function isCompound(u: AlgebraicExpression): u is Compound {
  return u.klass === klass.compound;
}

/** Type predicate. Claims and returns true if the given expression `u` is an {@link Int|integer}. False otherwise. */
function isInt(u: AlgebraicExpression): u is Int {
  return !$isNothing(u) && (u.op === core.int);
}

/** Type predicate. Claims and returns true if the given expression `u` is a {@link Real|real number}. False otherwise. */
function isReal(u: AlgebraicExpression): u is Real {
  return !$isNothing(u) && (u.op === core.real);
}

/** Type predicate. Claims and returns true if the given expression `u` is a {@link Sym|symbol}. False otherwise. Note that this will return true if `u` is `Undefined`, since `Undefined` is a symbol by definition. */
function isSymbol(u: AlgebraicExpression): u is Sym {
  return !$isNothing(u) && ((u.op === core.symbol) ||
    (u.op === core.undefined));
}

/** Type predicate. Claims and returns true if the given expression `u` is the global symbol Undefined (an instance of `Sym`, not the JavaScript `undefined`). False otherwise. Note that constant `Undefined` maps to the literal null. See {@link Sym}. */
function isUndefined(
  u: AlgebraicExpression,
): u is Constant<null, core.undefined> {
  return !$isNothing(u) && (u.op === core.undefined);
}

/** Type predicate. Returns true if the given expression is a constant, false otherwise. If true, claims that `u` is a constant. See {@link Constant}. */
function isConstant(u: AlgebraicExpression): u is Constant<number> {
  return !$isNothing(u) && (u.op === core.constant);
}

/** An atom is any expression that cannot be reduced further. This includes integers, reals, and symbols. */
abstract class Atom extends AlgebraicExpression {
  klass: klass.atom = klass.atom;
  constructor(op: string) {
    super(op, klass.atom);
  }
  set args(args: AlgebraicExpression[]) {}
  get args(): AlgebraicExpression[] {
    return [];
  }
  get numberOfOperands(): number {
    return 0;
  }
  operand(i: number): UNDEFINED {
    return Undefined();
  }
}

/** An atomic value corresponding to an integer. */
class Int extends Atom {
  isAlgebraic(): boolean {
    return true;
  }
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.int(this);
  }
  copy(): Int {
    const out = int(this.n);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: AlgebraicExpression): boolean {
    if (!isInt(other)) return false;
    return (other.n === this.n) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.n}`;
  }
  n: number;
  constructor(n: number) {
    super(core.int);
    this.n = n;
  }
  get isNegative() {
    return this.n < 0;
  }
  get isPositive() {
    return this.n > 0;
  }
  /**
   * Returns true if this integer is 1.
   * False otherwise.
   */
  get isOne() {
    return this.n === 1;
  }
  /**
   * Returns true if this integer is 0.
   * False otherwise.
   */
  get isZero() {
    return this.n === 0;
  }
}

/** Returns a new `Int`. */
function int(n: number) {
  return (new Int(n));
}

/** An atomic value corresponding to a floating point number. */
class Real extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.real(this);
  }
  isAlgebraic(): boolean {
    return true;
  }
  copy(): Real {
    const out = real(this.n);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: AlgebraicExpression): boolean {
    if (!isReal(other)) {
      return false;
    }
    return (this.n === other.n) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.n}`;
  }
  n: number;
  constructor(n: number) {
    super(core.real);
    this.n = n;
  }
}

/** Returns a new Real. */
function real(r: number) {
  return (new Real(r));
}

/** An atomic value corresponding to a symbol. */
class Sym<X extends string = string> extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sym(this);
  }
  isAlgebraic(): boolean {
    return true;
  }
  copy(): Sym {
    const out = sym(this.s);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: AlgebraicExpression): boolean {
    if (!isSymbol(other)) {
      return false;
    }
    return (this.s === other.s) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.s}`;
  }
  s: X;
  constructor(s: X) {
    const type = (s === core.undefined) ? core.undefined : core.symbol;
    super(type);
    this.s = s;
  }
}

/** A node corresponding a numeric constant. */
class Constant<
  P extends (number | null) = (number | null),
  X extends string = string,
> extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.constant(this);
  }
  isAlgebraic(): boolean {
    return true;
  }
  equals(other: AlgebraicExpression): boolean {
    if (!isConstant(other)) {
      return false;
    } else {
      return this.sameParenLevel(other) && (other.value === this.value);
    }
  }
  get isNegative() {
    if (this.value === null) {
      return false;
    }
    return this.value < 0;
  }
  get isPositive() {
    if (this.value === null) {
      return false;
    }
    return this.value > 0;
  }
  get isZero() {
    return false;
  }
  get isOne() {
    return false;
  }
  toString(): string {
    if (this.value === null) {
      return `Undefined`;
    } else {
      return `${this.value}`;
    }
  }
  copy() {
    const out = new Constant(this.c, this.value);
    out.parenLevel = this.parenLevel;
    return out;
  }
  c: X;
  value: P;
  constructor(c: X, value: P) {
    super(c === core.undefined ? core.undefined : core.constant);
    this.c = c;
    this.value = value;
  }
}

/**
 * Returns a new Undefined.
 */
function Undefined(): UNDEFINED {
  return new Constant(core.undefined, null);
}

type UNDEFINED = Constant<null, core.undefined>;

/**
 * Returns a new numeric constant.
 */
function constant(c: string, value: number) {
  return new Constant(c, value);
}

/**
 * Returns a new symbol.
 */
function sym(s: string) {
  return new Sym(s);
}

abstract class Compound extends AlgebraicExpression {
  op: string;
  args: AlgebraicExpression[];
  klass: klass.compound = klass.compound;
  constructor(op: string, args: AlgebraicExpression[]) {
    super(op, klass.compound);
    this.op = op;
    this.args = args;
  }
  get numberOfOperands(): number {
    return this.args.length;
  }
  toString(): string {
    const op = this.op;
    const args = this.args.map((x) => x.toString()).join(` ${op} `);
    if (this.parenLevel !== 0) {
      return parend(args);
    }
    return args;
  }
  equals(other: AlgebraicExpression): boolean {
    if (!(other instanceof Compound)) {
      return false;
    }
    if (this.op !== other.op) {
      return false;
    }
    if (this.args.length !== other.args.length) return false;
    if (this.parenLevel !== other.parenLevel) return false;
    for (let i = 0; i < this.args.length; i++) {
      const a = this.args[i];
      const b = other.args[i];
      if (!a.equals(b)) {
        return false;
      }
    }
    return true;
  }
}

// deno-fmt-ignore
type AlgOP = | core.sum | core.difference | core.product | core.quotient | core.power | core.factorial | core.fraction;

/**
 * A node corresponding to an algebraic operation.
 * Algebraic operations comprise of:
 *
 * 1. `+`
 * 2. `-`
 * 3. `*`
 * 4. `^`
 * 5. `!`
 * 6. `fraction`
 */
abstract class AlgebraicOp<OP extends AlgOP = AlgOP> extends Compound {
  op: OP;
  args: AlgebraicExpression[];
  abstract copy(): AlgebraicOp;
  isAlgebraic(): boolean {
    return true;
  }
  constructor(op: OP, args: AlgebraicExpression[]) {
    super(op, args);
    this.op = op;
    this.args = args;
  }
  /**
   * Returns the last operand of this operation.
   */
  last(): AlgebraicExpression {
    const out = this.args[this.args.length - 1];
    if (out === undefined) return Undefined();
    return out;
  }
  /**
   * The first operand of this operation.
   */
  head(): AlgebraicExpression {
    const out = this.args[0];
    if (out === undefined) return Undefined();
    return out;
  }
  /**
   * This operation’s operands, without the
   * first operand.
   */
  tail(): AlgebraicExpression[] {
    const out: AlgebraicExpression[] = [];
    for (let i = 1; i < this.args.length; i++) {
      out.push(this.args[i]);
    }
    return out;
  }
  operand(i: number): AlgebraicExpression {
    const out = this.args[i - 1];
    if (out === undefined) {
      return Undefined();
    } else {
      return out;
    }
  }
  /**
   * Returns a copy of this algebraic operation's
   * arguments.
   */
  argsCopy(): AlgebraicExpression[] {
    return this.args.map((x) => x.copy());
  }
}

/**
 * An algebrac expression corresponding to an n-ary sum.
 *
 * @example
 * const x = sum([sym('a'), int(2), sym('b')]) // x => a + 2 + b
 */
class Sum extends AlgebraicOp<core.sum> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sum(this);
  }

  op: core.sum = core.sum;
  copy(): Sum {
    const out = sum(this.argsCopy());
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(args: AlgebraicExpression[]) {
    super(core.sum, args);
  }
}

/**
 * Returns a new {@link Sum|sum expression}.
 */
function sum(args: AlgebraicExpression[]) {
  return new Sum(args);
}

/**
 * Type predicate. Returns true if `u` is a
 * {@link Sum|sum expression}, false otherwise.
 * If true, claims that `u` is a {@link Sum|sum expression}.
 */
function isSum(u: AlgebraicExpression): u is Sum {
  return !$isNothing(u) && (u.op === core.sum);
}

/**
 * An algebraic expression corresponding to an n-ary product.
 * @example
 * const x = product([int(1), int(8), int(9)]) // x => 1 * 8 * 9
 */
class Product extends AlgebraicOp<core.product> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.product(this);
  }

  op: core.product = core.product;
  copy(): Product {
    const out = product(this.argsCopy());
    out.parenLevel = this.parenLevel;
    return out;
  }
  toString(): string {
    const args = this.args;
    if (args.length === 2) {
      const [a, b] = args;
      if (
        (isConst(a) && isSymbol(b)) ||
        (isConst(a) && b.parenLevel !== 0) ||
        (isConst(a) && isAlgebraicFn(b))
      ) {
        return `${a.toString()}${b.toString()}`;
      }
    }
    const out: string[] = [];
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      out.push(a.toString());
    }
    const expr = out.join("");
    if (this.parenLevel !== 0) {
      return `(${expr})`;
    } else {
      return expr;
    }
  }
  constructor(args: AlgebraicExpression[]) {
    super(core.product, args);
  }
}

/**
 * Returns a new {@link Product|product expression}.
 */
function product(args: AlgebraicExpression[]) {
  return new Product(args);
}

/**
 * Type predicate. Returns true if `u` is a {@link Product|product expression},
 * false otherwise. If true, claims that `u` is a {@link Product|product expression}.
 */
function isProduct(u: AlgebraicExpression): u is Product {
  return !$isNothing(u) && (u.op === core.product);
}

/**
 * A node corresponding to a quotient. Quotients
 * are defined as binary expressions with the operator
 * {@link core.quotient|"/"}.
 */
class Quotient extends AlgebraicOp<core.quotient> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.quotient(this);
  }

  op: core.quotient = core.quotient;
  args: [AlgebraicExpression, AlgebraicExpression];
  copy(): Quotient {
    const left = this.dividend.copy();
    const right = this.divisor.copy();
    const out = quotient(left, right);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(dividend: AlgebraicExpression, divisor: AlgebraicExpression) {
    super(core.quotient, [dividend, divisor]);
    this.args = [dividend, divisor];
  }
  /**
   * Returns this quotient as a {@link Product|product}.
   * @example
   * const q = quotient(1,x) // 1/x
   * const p = q.asProduct() // 1 * x^-1
   */
  asProduct(): Product {
    const left = this.divisor.copy();
    const right = power(this.dividend.copy(), int(-1));
    const out = product([left, right]);
    out.parenLevel = this.parenLevel;
    return out;
  }
  /**
   * @property The divisor of this quotient.
   * @example
   * const q = quotient(sym('x'),sym('y')) // q => x/y
   * const d = q.divisor // d => sym('x')
   */
  get divisor() {
    return (this.args[1]);
  }
  /**
   * @property The dividend of this quotient.
   * @example
   * const q = quotient(sym('x'), sym('y')) // q => x/y
   * const d = q.dividend // d => sym('y')
   */
  get dividend() {
    return (this.args[0]);
  }
}

/**
 * Returns a new {@link Quotient|quotient}.
 */
function quotient(dividend: AlgebraicExpression, divisor: AlgebraicExpression) {
  return new Quotient(dividend, divisor);
}

/**
 * Type predicate. Returns true if `u` is a {@link Quotient|quotient expression},
 * false otherwise. If true, claims that `u` is a {@link Quotient|quotient expression}.
 */
function isQuotient(u: AlgebraicExpression): u is Quotient {
  return !$isNothing(u) && (u.op === core.quotient);
}

/**
 * A node corresponding to a fraction. Fractions are defined
 * as a pair of integers `[a,b]`, where `b ≠ 0`.
 */
class Fraction extends AlgebraicOp<core.fraction> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.fraction(this);
  }
  asFloat() {
    return (this.n / this.d);
  }
  get n() {
    return this.numerator.n;
  }
  get d() {
    return this.denominator.n;
  }
  asInt() {
    return floor(this.n / this.d);
  }
  static from(numberValue: number | Fraction) {
    if (!$isNumber(numberValue)) {
      return numberValue;
    }
    if (Number.isInteger(numberValue)) return Fraction.of(numberValue, 1);
    let eps = 1.0E-15;
    let h, h1, h2, k, k1, k2, a, x;
    x = numberValue;
    a = floor(x);
    h1 = 1;
    k1 = 0;
    h = a;
    k = 1;
    while (x - a > eps * k * k) {
      x = 1 / (x - a);
      a = floor(x);
      h2 = h1;
      h1 = h;
      k2 = k1;
      k1 = k;
      h = h2 + a * h1;
      k = k2 + a * k1;
    }
    return Fraction.of(h, abs(k));
  }
  static of(n: number, d: number) {
    return new Fraction(n, abs(d));
  }

  toString(): string {
    const n = this.numerator.n;
    const d = this.denominator.n;
    return `${n}|${d}`;
  }
  op: core.fraction = core.fraction;
  args: [Int, Int];
  copy(): Fraction {
    const n = this.args[0].n;
    const d = this.args[1].n;
    const out = frac(n, d);
    out.parenLevel = this.parenLevel;
    return out;
  }
  lt(other: Fraction) {
    return this.leq(other) && !this.equals(other);
  }
  pos() {
    const n = +this.n;
    const d = this.d;
    return new Fraction(n, d);
  }
  neg() {
    const n = -this.n;
    const d = this.d;
    return new Fraction(n, d);
  }
  gt(other: Fraction) {
    return !this.leq(other);
  }
  geq(other: Fraction) {
    return this.gt(other) || this.equals(other);
  }
  leq(other: Fraction) {
    const F1 = Fraction.simp(
      this.n,
      this.d,
    );
    const F2 = Fraction.simp(
      other.n,
      other.d,
    );
    return F1.n * F2.d <= F2.n * F1.d;
  }
  sub(x: Fraction) {
    return Fraction.simp(
      this.n * x.d - x.n * this.d,
      this.d * x.d,
    );
  }
  add(x: Fraction) {
    return Fraction.simp(
      this.n * x.d + x.n * this.d,
      this.d * x.d,
    );
  }
  div(x: Fraction) {
    return Fraction.simp(
      this.n * x.d,
      this.d * x.n,
    );
  }
  times(x: Fraction) {
    return Fraction.simp(
      x.n * this.n,
      x.d * this.d,
    );
  }
  equals(other: Fraction) {
    const a = Fraction.simp(this.n, this.d);
    const b = Fraction.simp(other.n, other.d);
    return (
      a.n === b.n &&
      a.d === b.d
    );
  }
  static simp(n: number, d: number) {
    const sgn = sign(n) * sign(d);
    const N = abs(n);
    const D = abs(d);
    const f = gcd(n, d);
    return Fraction.of((sgn * N) / f, D / f);
  }
  constructor(numerator: number, denominator: number) {
    const N = int(numerator);
    const D = int(abs(denominator));
    super(core.fraction, [N, D]);
    this.args = [N, D];
  }
  get isZero() {
    return this.numerator.n === 0;
  }
  get isOne() {
    return this.numerator.n === this.denominator.n;
  }
  get isPositive() {
    return this.numerator.n > 0;
  }
  get isNegative() {
    return this.numerator.n < 0;
  }
  /**
   * @property The numerator of this fraction (an {@link Int|integer}).
   * @example
   * frac(1,2).numerator // 1
   */
  get numerator() {
    return this.args[0];
  }
  /**
   * @property The denominator of this fraction (an {@link Int|integer}).
   * @example
   * frac(1,2).denominator // 2
   */
  get denominator() {
    return this.args[1];
  }
  /**
   * @property This fraction’s numerator and
   *           denominator in pair form.
   * @example
   * const a = frac(1,2);
   * const b = a.pair // [1,2]
   */
  get pair() {
    return tuple(this.numerator.n, this.denominator.n);
  }
}

/**
 * Type predicate. Returns true if `u` is a {@link Fraction|fraction},
 * false otherwise. If true, claims that `u` is a fraction.
 */
function isFrac(u: AlgebraicExpression): u is Fraction {
  return !$isNothing(u) && (u.op === core.fraction);
}

/**
 * Returns a new {@link Fraction|fraction}.
 */
function frac(numerator: number, denominator: number) {
  return new Fraction(numerator, denominator);
}

/**
 * Simplifies the given fraction.
 */
function simplyRational(expression: Fraction | Int) {
  const f = (u: Fraction | Int) => {
    if (isInt(u)) {
      return u;
    } else {
      const n = u.numerator;
      const d = u.denominator;
      if (rem(n.n, d.n) === 0) {
        return int(quot(n.n, d.n));
      } else {
        const g = gcd(n.n, d.n);
        if (d.n > 0) {
          return frac(quot(n.n, g), quot(d.n, g));
        } else {
          return frac(quot(-n.n, g), quot(-d.n, g));
        }
      }
    }
  };
  return f(expression);
}

/**
 * Returns the numerator of the given {@link Fraction|fraction}
 * or {@link Int|integer}. If an integer is passed, returns a
 * copy of the integer.
 */
function numeratorOf(u: Fraction | Int): number {
  if (isInt(u)) {
    return u.n;
  } else {
    return u.numerator.n;
  }
}

/**
 * Returns the denominator of the given {@link Fraction|fraction}
 * or {@link Int|integer}. If an integer is passed, returns `int(1)`.
 */
function denominatorOf(u: Fraction | Int): number {
  if (isInt(u)) {
    return 1;
  } else {
    return u.denominator.n;
  }
}

/**
 * Evaluates a sum.
 *
 * @param a - The left summand.
 * @param b - The right summand.
 */
function evalSum(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n + b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      (n1 * d2) + (n2 * d1),
      d1 * d2,
    ));
  }
}

/**
 * Evaluates a difference.
 *
 * @param a - The left minuend.
 * @param b - The right minuend.
 */
function evalDiff(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n - b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      n1 * d2 - n2 * d1,
      d1 * d2,
    ));
  }
}

/**
 * Returns the reciprocal of the given
 * {@link Int|integer} or {@link Fraction|fraction}.
 */
function reciprocal(a: Int | Fraction) {
  if (isInt(a)) {
    return frac(1, a.n);
  } else {
    return frac(
      a.denominator.n,
      a.numerator.n,
    );
  }
}

/**
 * Evaluates a quotient.
 *
 * @param a - The dividend.
 * @param b - The divisor.
 */
function evalQuot(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    if (b.isZero) {
      return Undefined();
    }
    return frac(a.n, b.n);
  } else {
    return evalProduct(a, reciprocal(b));
  }
}

/**
 * Evalutes a power.
 */
function evalPower(base: Int | Fraction, exponent: Int) {
  const f = (v: Int | Fraction, n: Int): Fraction | Int | UNDEFINED => {
    if (numeratorOf(v) !== 0) {
      if (n.n > 0) {
        const s = f(v, int(n.n - 1));
        if (isUndefined(s)) {
          return s;
        }
        return evalProduct(s, v);
      } else if (n.n === 0) {
        return int(1);
      } else if (n.n === -1) {
        return simplyRational(reciprocal(v));
      } else if (n.n < -1) { // x^(-2) => 1/(x^2)
        const s = evalQuot(reciprocal(v), int(1));
        if (isUndefined(s)) return s;
        return f(s, int(-n.n));
      } else {
        return Undefined();
      }
    } else {
      if (n.n >= 1) {
        return int(0);
      } else if (n.n <= 0) {
        return Undefined();
      } else {
        return Undefined();
      }
    }
  };
  return f(base, exponent);
}

/**
 * Evaluates a product.
 */
function evalProduct(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n * b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      n1 * n2,
      d1 * d2,
    ));
  }
}

/**
 * Simplifies a rational number expression.
 */
function simplify_RNE(expression: AlgebraicExpression) {
  const f = (u: AlgebraicExpression): Int | Fraction | UNDEFINED => {
    if (isInt(u)) {
      return u;
    } else if (isFrac(u)) {
      if (u.denominator.isZero) {
        return Undefined();
      } else {
        return u;
      }
    } else if (u.numberOfOperands === 1) {
      const v = f(u.operand(1));
      if (isUndefined(v)) {
        return Undefined();
      } else if (isSum(u)) {
        return v;
      } else if (isDifference(u)) {
        return evalProduct(int(-1), v);
      }
    } else if (u.numberOfOperands === 2) {
      if (isSum(u) || isProduct(u) || isDifference(u) || isQuotient(u)) {
        const v = f(u.operand(1));
        if (isUndefined(v)) {
          return Undefined();
        }
        const w = f(u.operand(2));
        if (isUndefined(w)) {
          return Undefined();
        }
        if (isSum(u)) {
          return evalSum(v, w);
        } else if (isDifference(u)) {
          return evalDiff(v, w);
        } else if (isProduct(u)) {
          return evalProduct(v, w);
        } else if (isQuotient(u)) {
          return evalQuot(v, w);
        }
      } else if (isPower(u)) {
        const v = f(u.operand(1));
        if (isUndefined(v)) {
          return Undefined();
        } else {
          // @ts-ignore
          return evalPower(v, u.operand(2));
        }
      }
    }
    return Undefined();
  };
  const v = f(expression);
  if (isUndefined(v)) {
    return v;
  }
  return simplyRational(v);
}

/**
 * An algebraic expression mapping to a power.
 */
class Power extends AlgebraicOp<core.power> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.power(this);
  }

  copy(): Power {
    const b = this.base.copy();
    const e = this.base.copy();
    const out = power(b, e);
    out.parenLevel = this.parenLevel;
    return out;
  }
  op: core.power = core.power;
  args: [AlgebraicExpression, AlgebraicExpression];
  constructor(base: AlgebraicExpression, exponent: AlgebraicExpression) {
    super(core.power, [base, exponent]);
    this.args = [base, exponent];
  }
  toString(): string {
    const base = this.base.toString();
    let exponent = this.exponent.toString();
    if (!isInt(this.exponent) && !isSymbol(this.exponent)) {
      exponent = `(${exponent})`;
    }
    const out = `${base}^${exponent}`;
    if (this.parenLevel !== 0) {
      return parend(out);
    } else {
      return out;
    }
  }
  /**
   * @property The base of this power.
   * @example
   * e^x // base is 'e'
   */
  get base() {
    return this.args[0];
  }
  /**
   * @property The exponent of this power.
   * @example
   * e^x // exponent is 'x'
   */
  get exponent() {
    return this.args[1];
  }
}

/**
 * Returns a new {@link Power|power expression}.
 *
 * @param base - The power expression’s base,
 *               which may be any {@link AlgebraicExpression|algebraic expression}.
 *
 * @param exponent - The power expression’s exponent,
 *                   which may be any
 *                   {@link AlgebraicExpression|algebraic expression}.
 *
 * @example
 * power(int(1), sym('x')) // maps to 1^x
 */
function power(base: AlgebraicExpression, exponent: AlgebraicExpression) {
  return new Power(base, exponent);
}

/**
 * Type guard. Returns true if `u` is a {@link Power|power expression},
 * false otherwise.
 */
function isPower(u: AlgebraicExpression): u is Power {
  return !$isNothing(u) && (u.op === core.power);
}

/**
 * A node corresponding to a difference.
 */
class Difference extends AlgebraicOp<core.difference> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.difference(this);
  }

  op: core.difference = core.difference;
  args: [AlgebraicExpression, AlgebraicExpression];
  copy(): Difference {
    const left = this.left.copy();
    const right = this.right.copy();
    const out = difference(left, right);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(left: AlgebraicExpression, right: AlgebraicExpression) {
    super(core.difference, [left, right]);
    this.args = [left, right];
  }
  /**
   * Returns the left minuend of this difference.
   * @example
   * a - b // left is 'a'
   */
  get left() {
    return this.args[0];
  }
  /**
   * Returns the right minuend of this difference.
   * @example
   * a - b // right is 'b'
   */
  get right() {
    return this.args[1];
  }
  /**
   * Returns this difference as a sum. I.e., where L is the lefthand minuend
   * and R is the righthand minuend:
   *
   * ~~~ts
   * L - R becomes L + (-1 * R)
   * ~~~
   */
  toSum() {
    const left = this.left;
    const right = product([int(-1), this.right]).tickParen();
    return sum([left, right]);
  }
}

/**
 * Returns an expression corresponding to the difference:
 *
 * ~~~ts
 * a - b
 * ~~~
 */
function difference(a: AlgebraicExpression, b: AlgebraicExpression) {
  return new Difference(a, b);
}

/**
 * __Type Predicate__. Returns true if `u` is {@link Difference|difference expression},
 * false otherwise.
 */
function isDifference(u: AlgebraicExpression): u is Difference {
  return !$isNothing(u) && (u.op === core.difference);
}

/**
 * Returns the provided algebraic expression `u`,
 * negated. Negation is defined as a product:
 *
 * ~~~ts
 * -1 * u
 * ~~~
 */
function negate(u: AlgebraicExpression) {
  return product([int(-1), u]).tickParen();
}

/**
 * A node corresponding to the mathematical factorial.
 * The factorial is always a unary operation.
 */
class Factorial extends AlgebraicOp<core.factorial> {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.factorial(this);
  }

  op: core.factorial = core.factorial;
  args: [AlgebraicExpression];
  copy(): Factorial {
    const arg = this.arg.copy();
    const out = factorial(arg);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(arg: AlgebraicExpression) {
    super(core.factorial, [arg]);
    this.args = [arg];
  }
  /**
   * Returns the argument of this factorial.
   * @example
   * x! // arg is 'x'
   */
  get arg() {
    return this.args[0];
  }
  toString(): string {
    return `${this.arg.toString()}!`;
  }
}

/**
 * Returns a new {@link Factorial|factorial}.
 */
function factorial(of: AlgebraicExpression) {
  return new Factorial(of);
}

/**
 * __Type Predicate__. Returns true if the expression `u`
 * is a {@link Factorial|factorial expression}, false
 * otherwise.
 */
function isFactorial(u: AlgebraicExpression): u is Factorial {
  return !$isNothing(u) && (u.op === core.factorial);
}

/**
 * A node corresponding to any function that takes
 * arguments of type {@link AlgebraicExpression|algebraic expression}.
 */
class AlgebraicFn extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.algebraicFn(this);
  }

  isAlgebraic(): boolean {
    return true;
  }
  op: string;
  args: AlgebraicExpression[];
  copy(): AlgebraicFn {
    const out = fn(this.op, this.args.map((c) => c.copy()));
    out.parenLevel = this.parenLevel;
    return out;
  }
  operand(i: number): AlgebraicExpression {
    const out = this.args[i - 1];
    if (out === undefined) {
      return Undefined();
    } else {
      return out;
    }
  }
  constructor(op: string, args: AlgebraicExpression[]) {
    super(op, args);
    this.op = op;
    this.args = args;
  }
  toString(): string {
    const name = this.op;
    const args = this.args.map((x) => x.toString()).join(",");
    return `${name}(${args})`;
  }
}

/**
 * Returns a new set.
 */
function setof<T>(...args: T[]) {
  return new Set(args);
}

/**
 * Returns a new algebraic function.
 */
function fn(name: string, args: AlgebraicExpression[]) {
  return new AlgebraicFn(name, args);
}

/**
 * Type predicate. Returns true if the given expression `u`
 * is an {@link AlgebraicFn|algebraic function}, false
 * otherwise. If true, claims that `u` is an
 * {@link AlgebraicFn|algebraic function}.
 */
function isAlgebraicFn(u: AlgebraicExpression): u is AlgebraicFn {
  return u instanceof AlgebraicFn;
}

/**
 * Returns all complete subexpressions of the given
 * expression.
 */
function subex(expression: AlgebraicExpression) {
  const out: AlgebraicExpression[] = [];
  const set = setof<string>();
  const f = (u: AlgebraicExpression) => {
    if (isAtom(u)) {
      const s = u.toString();
      if (!set.has(s)) {
        out.push(u);
        set.add(s);
      }
      return null;
    } else {
      const s = u.toString();
      if (!set.has(s)) {
        out.push(u);
        u.args.forEach((x) => f(x));
        set.add(s);
      }
      return null;
    }
  };
  f(expression);
  return out;
}

/**
 * Returns true if the given `expression` does not contain the given
 * `variable`.
 */
function freeof(expression: AlgebraicExpression, variable: Sym | string) {
  const t = typeof variable === "string" ? sym(variable) : variable;
  const f = (u: AlgebraicExpression): boolean => {
    if (u.equals(t)) {
      return false;
    } else if (isAtom(u)) {
      return true;
    } else {
      let i = 1;
      while (i <= u.numberOfOperands) {
        const x = f(u.operand(i));
        if (!x) {
          return false;
        }
        i += 1;
      }
      return true;
    }
  };
  return f(expression);
}

/**
 * Returns the term of this expression.
 */
function termOf(u: AlgebraicExpression) {
  if (
    isSymbol(u) || isSum(u) || isPower(u) || isFactorial(u) || isAlgebraicFn(u)
  ) {
    return u;
  } else if (isProduct(u)) {
    if (isConst(u.args[0])) {
      const out = product(u.tail());
      if (out.args.length === 1) {
        return out.args[0];
      } else {
        return out;
      }
    } else {
      return u;
    }
  } else {
    return Undefined();
  }
}

/**
 * Returns true if the given expression is a constant.
 */
function isConst(
  u: AlgebraicExpression,
): u is Int | Fraction | Constant<number> {
  return (
    !$isNothing(u) && ((u.op === core.int) ||
      (u.op === core.fraction) ||
      (u.op === core.constant)) &&
    (
      !isUndefined(u)
    )
  );
}

/**
 * Returns the constant of the given
 * expression `u`.
 */
function constantOf(u: AlgebraicExpression) {
  if (
    isSymbol(u) || isSum(u) || isPower(u) || isFactorial(u) || isAlgebraicFn(u)
  ) {
    return int(1);
  } else if (isProduct(u)) {
    const head = u.head();
    if (isConst(head)) {
      return head;
    } else {
      return int(1);
    }
  } else {
    return Undefined();
  }
}

/**
 * Returns the base of the given expression `u`.
 */
function baseOf(u: AlgebraicExpression) {
  if (
    isSymbol(u) || isProduct(u) || isSum(u) || isFactorial(u) ||
    isAlgebraicFn(u)
  ) {
    return u;
  } else if (isPower(u)) {
    return u.base;
  } else {
    return Undefined();
  }
}

/**
 * Returns the exponent of the given expression `u`.
 */
function exponentOf(u: AlgebraicExpression) {
  if (
    isSymbol(u) || isProduct(u) || isSum(u) || isFactorial(u) ||
    isAlgebraicFn(u)
  ) {
    return int(1);
  } else if (isPower(u)) {
    return u.exponent;
  } else {
    return Undefined();
  }
}

/**
 * Returns true if `u` is equal to `v`,
 * false otherwise.
 */
function equals(u: Fraction | Int, v: Fraction | Int) {
  if (isInt(u) && isInt(v)) {
    return u.n === v.n;
  } else {
    const A = simplyRational(u);
    const B = simplyRational(v);
    const n1 = numeratorOf(A);
    const d1 = denominatorOf(A);
    const n2 = numeratorOf(B);
    const d2 = denominatorOf(B);
    return (
      (n1 === n2) &&
      (d1 === d2)
    );
  }
}

/**
 * Returns true if `u` is less than `v`,
 * false otherwise.
 */
function lt(u: Fraction | Int, v: Fraction | Int) {
  return lte(u, v) && !equals(u, v);
}

/**
 * Returns true if `u` is greater than `v`,
 * false otherwise.
 */
function gt(u: Fraction | Int, v: Fraction | Int) {
  return !lte(u, v);
}

/**
 * Returns true if `u` is greater than or equal to `v`,
 * false otherwise.
 */
function gte(u: Fraction | Int, v: Fraction | Int) {
  return gt(u, v) || equals(u, v);
}

/**
 * Returns true if `u` is less than or equal to `v`,
 * false otherwise.
 */
function lte(u: Fraction | Int, v: Fraction | Int): boolean {
  if (isInt(u) && isInt(v)) {
    return u.n <= v.n;
  } else {
    const A = simplyRational(u);
    const B = simplyRational(v);
    const n1 = numeratorOf(A);
    const d1 = denominatorOf(A);
    const n2 = numeratorOf(B);
    const d2 = denominatorOf(B);
    return (
      (n1 * d2) <= (n2 * d1)
    );
  }
}

/**
 * __Type Guard__. Returns true if `u` is a
 * {@link Sum|sum} or {@link Product|product},
 * false otherwise.
 */
function isSumlike(u: AlgebraicExpression): u is Sum | Product {
  return (isSum(u)) || isProduct(u);
}

/**
 * __Type Guard__. Returns true if `u` is an
 * {@link Int|integer} or {@link Fraction|fraction},
 * false otherwise.
 */
function isNumeric(u: AlgebraicExpression): u is Int | Fraction {
  return isInt(u) || isFrac(u);
}

/**
 * Returns true if `expression1` precedes `expression2`,
 * false otherwise.
 */
function precedes(
  expression1: AlgebraicExpression,
  expression2: AlgebraicExpression,
) {
  /**
   * Numeric ordering.
   */
  const O1 = (u: Fraction | Int, v: Fraction | Int) => (lt(u, v));

  /**
   * Lexicographic ordering.
   */
  const O2 = (u: Sym, v: Sym) => (u.s < v.s);

  /**
   * Summand ordering.
   */
  const O3 = (u: Sum | Product, v: Sum | Product): boolean => {
    if (!(u.last().equals(v.last()))) {
      return order(u.last(), v.last());
    }
    const m = u.numberOfOperands;
    const n = v.numberOfOperands;
    const k = min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k; j++) {
        const o1 = u.operand(m - j);
        const o2 = v.operand(n - j);
        if (!o1.equals(o2)) {
          return order(o1, o2);
        }
      }
    }
    return m < n;
  };

  /**
   * Power ordering.
   */
  const O4 = (u: Power, v: Power): boolean => {
    const uBase = baseOf(u);
    const vBase = baseOf(v);
    if (!uBase.equals(vBase)) {
      return order(uBase, vBase);
    } else {
      const uExponent = exponentOf(u);
      const vExponent = exponentOf(v);
      return order(uExponent, vExponent);
    }
  };

  /**
   * Factorial ordering.
   */
  const O5 = (u: Factorial, v: Factorial): boolean => {
    const uArg = u.arg;
    const vArg = v.arg;
    return order(uArg, vArg);
  };

  /**
   * Function ordering.
   */
  const O6 = (u: AlgebraicFn, v: AlgebraicFn): boolean => {
    if (u.op !== v.op) {
      return u.op < v.op; // lexicographic
    } else {
      const uOp1 = u.operand(1);
      const uOp2 = u.operand(1);
      if (!uOp1.equals(uOp2)) {
        return order(uOp1, uOp2);
      }
    }
    const m = u.numberOfOperands;
    const n = v.numberOfOperands;
    const k = min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k - 1; j++) {
        const o1 = u.operand(m - j);
        const o2 = u.operand(n - j);
        if (!o1.equals(o2)) {
          return order(o1, o2);
        }
      }
    }
    return m < n;
  };
  // O7 omitted - if u is a numeric, it shall always be precedent.

  const O8 = (u: Product, v: Power | Sum | Factorial | AlgebraicFn | Sym) => {
    if (!u.equals(v)) {
      return order(u.last(), v);
    } else {
      return true;
    }
  };
  const O9 = (u: Power, v: Sum | Factorial | AlgebraicFn | Sym) => {
    return order(u, power(v, int(1)));
  };
  const O10 = (u: Sum, v: Factorial | AlgebraicFn | Sym) => {
    if (!u.equals(v)) {
      return order(u, sum([int(0), v]));
    } else {
      return true;
    }
  };
  const O11 = (u: Factorial, v: AlgebraicFn | Sym) => {
    const o1 = u.operand(1);
    if (o1.equals(v)) {
      return false;
    } else {
      return order(u, factorial(v));
    }
  };
  const O12 = (u: AlgebraicFn, v: Sym) => {
    return order(sym(u.op), v);
  };
  // deno-fmt-ignore
  const order = (u: AlgebraicExpression, v: AlgebraicExpression): boolean => {
    if (isNumeric(u) && isNumeric(v)) return O1(u, v);
    if (isSymbol(u) && isSymbol(v)) return O2(u, v);
    if (isSumlike(u) && isSumlike(v)) return O3(u, v);
    if (isPower(u) && isPower(v)) return O4(u, v);
    if (isFactorial(u) && isFactorial(v)) return O5(u, v);
    if (isAlgebraicFn(u) && isAlgebraicFn(v)) return O6(u, v);
    if (isNumeric(u)) return true; // rule O7 -- numerics are always precedent.
    if (isProduct(u) && (isPower(v) || isSum(v) || isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O8(u, v);
    if (isPower(u) && (isSum(v) || isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O9(u, v);
    if (isSum(u) && ( isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O10(u, v);
    if (isFactorial(u) && ( isAlgebraicFn(v) || isSymbol(v))) return O11(u, v);
    if (isAlgebraicFn(u) && isSymbol(v)) return O12(u, v);
    return false;
  };
  return order(expression1, expression2);
}

/**
 * Sorts the given list of algebraic expressions.
 */
function sortex(expressions: AlgebraicExpression[]) {
  const out: AlgebraicExpression[] = [];
  if (expressions.length === 0) {
    return out;
  }
  if (expressions.length === 1) {
    return [expressions[0]];
  }
  for (let i = 0; i < expressions.length; i++) {
    out.push(expressions[i]);
  }
  return out.sort((a, b) => precedes(a, b) ? -1 : 1);
}

/**
 * Returns true if the given list of algebraic expressions
 * contains the symbol {@link UNDEFINED|Undefined}.
 */
function hasUndefined(args: AlgebraicExpression[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isUndefined(arg)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the given list of algebraic
 * expressions contains the {@link Int|integer} `0`.
 */
function hasZero(args: AlgebraicExpression[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isConst(arg) && arg.isZero) {
      return true;
    }
  }
  return false;
}

/**
 * Applies the given function `f` to the given `expression`,
 * which is either an {@link AlgebraicOp|algebraic operation}
 * or an {@link AlgebraicFn|algebraic function}.
 *
 * @example
 *
 * // the function 'f'
 * const square = (
 *   expr: AlgebraicExpression
 * ) => power(expr, int(2));
 *
 * // the expression
 * const s = sum([sym("a"), sym("b"), sym("c")]);
 *
 * console.log(s.toString()) // a + b + c
 *
 * const x = argMap(square, s);
 *
 * console.log(x.toString()); // a^2 + b^2 + c^2
 */
function argMap(
  F: (x: AlgebraicExpression) => AlgebraicExpression,
  expression: AlgebraicExpression,
) {
  const out = expression.args.map(F);
  const op = expression.copy();
  op.args = out;
  return op;
}

/**
 * Applies the given callback `G` to each argument expression of
 * `args`, with the operator `op`.
 *
 * @example
 * const G = (
 *   args: AlgebraicExpression[]
 *  ) => sum([
 *   power(args[0], int(2)),
 *   power(args[1], int(3)),
 *   power(args[2], int(4))
 * ]);
 *
 * const x = opMap(G,
 *  sum([sym("a"), sym("b")]),
 *  [sym("c"), sym("d")]
 * );
 *
 * print(x.toString()); // ((a^2)+(c^3)+(d^4))+((b^2)+(c^3)+(d^4))
 */
function opMap<T extends (AlgebraicOp | AlgebraicFn)>(
  G: (args: AlgebraicExpression[]) => AlgebraicExpression,
  op: T,
  args: AlgebraicExpression[],
) {
  const operands: AlgebraicExpression[] = [];
  op.args.forEach((arg) => {
    operands.push(G([arg, ...args]));
  });
  switch (op.op) {
    case core.factorial: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      return factorial(a) as any as T;
    }
    case core.sum:
      return sum(operands) as any as T;
    case core.product:
      return product(operands) as any as T;
    case core.difference: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return difference(a, b) as any as T;
    }
    case core.power: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return power(a, b) as any as T;
    }
    case core.quotient: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return quotient(a, b) as any as T;
    }
    default: {
      return fn(op.op, operands) as any as T;
    }
  }
}

/**
 * Returns a new list with `expression` placed at the beginning of `list`.
 */
function adjoin(expression: AlgebraicExpression, list: AlgebraicExpression[]) {
  const out: AlgebraicExpression[] = [expression];
  for (let i = 0; i < list.length; i++) {
    out.push(list[i]);
  }
  return out;
}

/**
 * Returns the given expression list without
 * the first member.
 */
function rest(expressions: AlgebraicExpression[]): AlgebraicExpression[] {
  const out: AlgebraicExpression[] = [];
  for (let i = 1; i < expressions.length; i++) {
    out.push(expressions[i]);
  }
  return out;
}

function factorialize(num: number) {
  if (num === 0 || num === 1) {
    return 1;
  }
  for (var i = num - 1; i >= 1; i--) {
    num *= i;
  }
  return num;
}

function derivative(expression: AlgebraicExpression, variable: string | Sym) {
  const x = $isString(variable) ? sym(variable) : variable;
  const deriv = (u: AlgebraicExpression): AlgebraicExpression => {
    if (isSymbol(u)) {
      return u;
    }
    u = simplify(u);
    /**
     * __DERIV-1__.
     */
    if (u.equals(x)) {
      return int(1);
    }
    /**
     * __DERIV-2__
     */
    if (isPower(u)) {
      const v = u.base;
      const w = u.exponent;
      if (isConst(w)) {
        const x = simplify(v);
        const r_1 = simplify(difference(w, int(1)));
        const p = simplify(power(x, r_1));
        return simplify(product([w, p]));
      }
      const D1 = simplify(deriv(v));
      const DIFF = simplify(difference(w, int(1)));
      const P1 = simplify(power(v, DIFF));
      const lhs = simplify(product([w, P1, D1]));
      const D2 = simplify(deriv(w));
      const P2 = simplify(power(v, w));
      const LN = fn("ln", [v]);
      const rhs = simplify(product([D2, P2, LN]));
      const out = simplify(sum([lhs, rhs]));
      return simplify(out);
    }
    /**
     * __DERIV-3__
     */
    if (isSum(u)) {
      const v = simplify(u.args[0]);
      const w = simplify(difference(u, v));
      const lhs = simplify(deriv(v));
      const rhs = simplify(deriv(w));
      return simplify(sum([lhs, rhs]));
    }
    /**
     * __DERIV-4__
     */
    if (isProduct(u)) {
      const v = simplify(u.args[0]);
      const w = simplify(quotient(u, v));
      const D1 = simplify(deriv(v));
      const D2 = simplify(deriv(w));
      const lhs = simplify(product([D1, w]));
      const rhs = simplify(product([v, D2]));
      return simplify(sum([lhs, rhs]));
    }
    /**
     * __DERIV-5__.
     */
    if (isAlgebraicFn(u)) {
      if (u.op === "sin") {
        const lhs = fn("cos", u.args);
        const rhs = simplify(deriv(u.args[0]));
        return simplify(product([lhs, rhs]));
      }
    }
    if (freeof(u, x)) {
      return int(0);
    }
    return Undefined();
  };
  return deriv(simplify(expression));
}

function simplify(expression: AlgebraicExpression) {
  const simplify_function = (expr: AlgebraicFn): AlgebraicExpression => {
    return expr;
  };
  const simplify_factorial = (expr: Factorial): AlgebraicExpression => {
    const arg = expr.arg;
    if (isUndefined(arg)) {
      return arg;
    }
    const newarg = automatic_simplify(arg);
    if (isInt(newarg)) {
      const out = factorialize(newarg.n);
      return int(out);
    }
    return factorial(newarg);
  };

  const simplify_difference = (expr: Difference): AlgebraicExpression => {
    const lhs = expr.left;
    const right = expr.right;
    const pargs = precedes(int(-1), right)
      ? [int(-1), right]
      : [right, int(-1)];
    const rhs = simplify_product(product(pargs));
    return simplify_sum(sum([lhs, rhs]));
  };

  const simplify_quotient = (expr: Quotient): AlgebraicExpression => {
    const u = expr.dividend;
    const v = expr.divisor;
    const rhs = simplify_power(power(v, int(-1)));
    return simplify_product(product([u, rhs]));
  };

  const simplify_sum = (expr: Sum): AlgebraicExpression => {
    const merge_sums = (
      a: AlgebraicExpression[],
      b: AlgebraicExpression[],
    ): AlgebraicExpression[] => {
      const p = sortex(a);
      const q = sortex(b);
      if (q.length === 0) {
        return p;
      } else if (p.length === 0) {
        return q;
      }
      const p1 = p[0];
      const q1 = q[0];
      const h = simplify_sum_rec([p1, q1]);
      if (h.length === 0) {
        return merge_sums(rest(p), rest(q));
      } else if (h.length === 1) {
        return adjoin(h[0], merge_sums(rest(p), rest(q)));
      } else if (h.length === 2 && (h[0].equals(p1) && h[1].equals(q1))) {
        return adjoin(p1, merge_sums(rest(p), q));
      } else {
        return adjoin(q1, merge_sums(p, rest(q)));
      }
    };
    // deno-fmt-ignore
    const simplify_sum_rec = (L: AlgebraicExpression[]): AlgebraicExpression[] => {
      if (L.length === 2 && (!isSum(L[0])) && (!isSum(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];

        /**
         * __SPSMREC-1.1__
         */
        if (isConst(u1) && isConst(u2)) {
          const P = simplify_RNE(sum([u1, u2]));
          if (P.isZero) {
            return [];
          } else {
            return [P];
          }
        }

        /**
         * __SPSMREC-1.2(a)__
         */
        if (isConst(u1) && u1.isZero) {
          return [u2];
        }

        /**
         * __SPSMREC-1.2(b)__
         */
        if (isConst(u2) && u2.isZero) {
          return [u1];
        }

        /**
         * __SPSMREC-1.3__ Collect integer and fraction
         * coefficient of like terms in a sum.
         */
        const u1Term = termOf(u1);
        const u2Term = termOf(u2);
        if (u1Term.equals(u2Term)) {
          const S = simplify_sum(sum([constantOf(u1), constantOf(u2)]));
          const P = simplify_product(product([u1Term, S]))
          if (isConst(P) && P.isZero) {
            return [];
          } else {
            return [P];
          }
        }

        /**
         * __SPSMREC-1.4__ Order the arguments.
         */
        if (precedes(u2, u1)) {
          return [u2, u1];
        }

        /**
         * __SPSMREC-1.5__
         */
        return L;
      }
      if (L.length === 2 && (isSum(L[0]) || isSum(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];
        if (isSum(u1) && isSum(u2)) {
          return merge_sums(u1.args, u2.args);
        }
        else if (isSum(u1) && !isSum(u2)) {
          return merge_sums(u1.args, [u2]);
        }
        else {
          return merge_sums([u1], u2.args);
        }
      }
      else {
        const w = simplify_sum_rec(rest(L));
        const u1 = L[0];
        if (isSum(u1)) {
          return merge_sums(u1.args, w);
        } else {
          return merge_sums([u1], w);
        }
      }
    };
    const spsm = (u: Sum): AlgebraicExpression => {
      const L = u.args;
      /**
       * __SPSM-1__.
       */
      if (hasUndefined(L)) {
        return Undefined();
      }

      // sum has no analogue for SPRD-2

      /**
       * __SPSM-3__.
       */
      if (L.length === 1) {
        return L[0];
      }

      /**
       * __SPSM_4__. The first first 2 rules do not apply.
       */
      const v = simplify_sum_rec(L);
      if (v.length === 1) {
        return v[0];
      }
      if (v.length >= 2) {
        return sum(v);
      }
      return int(0);
    };
    return spsm(expr);
  };

  const simplify_product = (expr: Product): AlgebraicExpression => {
    /**
     * Where `p` and `q` are two ordered lists of factors,
     * merges the two lists.
     */
    // deno-fmt-ignore
    const merge_products = (a: AlgebraicExpression[], b: AlgebraicExpression[]): AlgebraicExpression[] => {
      const p = sortex(a);
      const q = sortex(b);

      /**
       * __MPRD-1__.
       */
      if (q.length === 0) {
        return p;
      }
      else if (p.length === 0) {
        return q;
      }
      const p1 = p[0];
      const q1 = q[0];
      const h = simplify_product_rec([p1, q1]);
      if (h.length === 0) {
        return merge_products(rest(p), rest(q));
      }
      else if (h.length === 1) {
        return adjoin(h[0], merge_products(rest(p),rest(q)));
      }
      else if (h.length===2 && h[0].equals(p1) && h[1].equals(q1)) {
        return adjoin(p1, merge_products(rest(p),q));
      }
      else {
        return adjoin(q1, merge_products(p,rest(q)));
      }
    };

    /**
     * Simplifies a product’s argument list recursively.
     */
    // deno-fmt-ignore
    const simplify_product_rec = (L: AlgebraicExpression[]): AlgebraicExpression[] => {
      /**
       * __SPRDREC-1__. Case: There are two arguments, neither of which is a product.
       */
      if (L.length === 2 && !isProduct(L[0]) && !isProduct(L[1])) {
        const u1 = L[0];
        const u2 = L[1];
        /**
         * __SPRDREC-1.1__.
         */
        if (isConst(u1) && isConst(u2)) {
          const P = simplify_RNE(product([u1, u2]));
          if (P.isOne) {
            return [];
          } else {
            return [P];
          }
        }
        /**
         * __SPRDREC-1.2(a)__
         */
        if (isConst(u1) && u1.isOne) {
          return [u2];
        }
        /**
         * __SPRDREC-1.2(b)__
         */
        if (isConst(u2) && u2.isOne) {
          return [u1];
        }
        /**
         * __SPRDREC-1.3__.
         */
        const u1_base = baseOf(u1);

        const u2_base = baseOf(u2);

        if (u1_base.equals(u2_base)) {
          const S = simplify_sum(sum([exponentOf(u1), exponentOf(u2)]));
          const P = simplify_power(power(u1_base, S));
          if (isConst(P) && P.isOne) {
            return [];
          } else {
            return [P];
          }
        }

        /**
         * __SPRDREC-1.4__.
         */
        if (precedes(u2, u1)) {
          return [u2, u1];
        }
        /**
         * __SPRDREC-1.5__. Case: None of the first four laws apply.
         */
        return L;
      }

      /**
       * __SPRDREC-2__. Case: There are two arguments, one of which is a product.
       */
      if (L.length === 2 && (isProduct(L[0]) || isProduct(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];

        /**
         * __SPRDREC-2.1__. `u1` is a product and `u2` is a product.
         */
        if (isProduct(u1) && isProduct(u2)) {
          return merge_products(u1.args, u2.args);
        } /**
         * __SPRDREC-2.2__. `u1` is a product and `u2` is not a product.
         */
        else if (isProduct(u1) && !isProduct(u2)) {
          return merge_products(u1.args, [u2]);
        } /**
         * __SPRDREC-2.3__. `u2` is a product and `u1` is not a product
         */
        else {
          return merge_products([u1], u2.args);
        }
      } /**
       * __SPRDREC-3__. Case: There are more than two arguments.
       */
      else {
        const w = simplify_product_rec(rest(L));
        const u1 = L[0];
        if (isProduct(u1)) {
          return merge_products(u1.args, w);
        } else {
          return merge_products([u1], w);
        }
      }
    };

    const sprd = (u: Product) => {
      const L = u.args;
      /**
       * __SPRD-1__. `u`’s arguments contain the symbol `Undefined`.
       */
      if (hasUndefined(L)) {
        return Undefined();
      }

      /**
       * __SPRD-2__. `u`’s arguments contain a zero.
       */
      if (hasZero(L)) {
        return int(0);
      }

      /**
       * __SPRD-3__. `u`’s arguments are of length 1.
       */
      if (L.length === 1) {
        return L[0];
      }

      /**
       * __SPRD-4__. None of the first three rules apply.
       */
      const v = simplify_product_rec(L);

      /**
       * __SPRD-4.1__. Case: L reduced to a single operand.
       */
      if (v.length === 1) {
        return v[0];
      }

      /**
       * __SPRD-4.2__. Case: L reduced to at least two operands.
       */
      if (v.length >= 2) {
        return product(v);
      }

      /**
       * __SPRD-4.3__. Case: L reduced to zero operands.
       */
      return int(1);
    };

    return sprd(expr);
  };

  /**
   * Simpifies a power expression.
   */
  const simplify_power = (u: Power): AlgebraicExpression => {
    // deno-fmt-ignore
    const simplify_integer_power = (v: AlgebraicExpression, n: Int): AlgebraicExpression => {
      /**
       * __SINTPOW-1__. We handle the simple case where it’s a number (or fraction)
       * raised to an integer.
       */
      if (isNumeric(v)) {
        return simplify_RNE(power(v, n));
      }

      /**
       * __SINTPOW-2__. Next, the case where `n = 0`. In that case, we return `1`,
       * per the familiar rule `k^0 = 1`, where `k` is some number.
       */
      if (n.isZero) {
        return int(1);
      }

      /**
       * __SINTPOW-3__. Now the case where `n = 1`. Once more, we apply a basic
       * rule: `k^1 = k`, where `k` is some expression.
       */
      if (n.isOne) {
        return v;
      }

      /**
       * __SINTPOW-4__. We handle the case `(r^s)^n = r^(s * n)`.
       */
      if (isPower(v)) {
        const r = v.base;
        const s = v.exponent;
        const p = simplify_product(product([s, n]));
        if (isInt(p)) {
          return simplify_integer_power(r, p);
        } else {
          return power(r, p);
        }
      }

      /**
       * __SINTPOW 5__. This handles the case:
       * `v^n = (v_1, * ... * v_m)^n = v_1^n * ... * v_m^n`
       */
      if (isProduct(v)) {
        const args: AlgebraicExpression[] = [];

        for (let i = 0; i < v.numberOfOperands; i++) {
          const r_i = simplify_integer_power(v.args[i], n);
          args.push(r_i);
        }

        const r = product(args);

        return simplify_product(r);
      }

      /**
       * __SINTPOW-6__. None of the rules apply.
       */
      return power(v, n);
    };
    /**
     * We start by supposing `u = v^w`. Therefore, `v` is the base,
     * and `w` is the exponent.
     */
    const spow = (v: AlgebraicExpression, w: AlgebraicExpression) => {
      /**
       * We handle the simplest case:
       *
       * __SPOW-1__. If v is undefined and w is undefined, return undefined.
       */
      if (isUndefined(v) || isUndefined(w)) {
        return Undefined();
      }

      /**
       * Next, the case where `0^w`. This should return 0. But, mathematically,
       * `0^0` is undefined. Likewise, `0^-n`, where `n` is a positive integer,
       * is always undefined (since this would yield 1/0^n = 1/0).
       *
       * __SPOW-2__. If `v = 0`, then:
       * 1. If `w > 0` return `0`.
       * 2. Else, return `Undefined`.
       */
      if (isConst(v) && v.isZero) {
        if (isConst(w) && w.isPositive) {
          return int(0);
        } else {
          return Undefined();
        }
      }

      /**
       * Now we handle another simple case: `1^w.`
       *
       * __SPOW-3__. If `v = 1`, then return `1`.
       */
      if (isConst(v) && v.isOne) {
        return int(1);
      }

      /**
       * Now we handle the case where `w` is some integer.
       * E.g., (a + b)^2.
       *
       * __SPOW-4__.
       */
      if (isInt(w)) {
        return simplify_integer_power(v, w);
      }

      /**
       * None of the 4 previous rules apply, so we return `u`.
       */
      return u;
    };

    return spow(u.base, u.exponent);
  };

  /**
   * Simplifies the given algebraic expression `u`. This is the main
   * simplification algorithm.
   */
  const automatic_simplify = (u: AlgebraicExpression): AlgebraicExpression => {
    if (u instanceof Atom) {
      return u;
    } else if (isFrac(u)) {
      return simplyRational(u);
    } else {
      const v = argMap(automatic_simplify, u);
      if (isPower(v)) {
        return simplify_power(v);
      } else if (isProduct(v)) {
        return simplify_product(v);
      } else if (isSum(v)) {
        return simplify_sum(v);
      } else if (isQuotient(v)) {
        return simplify_quotient(v);
      } else if (isDifference(v)) {
        return simplify_difference(v);
      } else if (isFactorial(v)) {
        return simplify_factorial(v);
      } else if (isAlgebraicFn(v)) {
        return simplify_function(v);
      } else {
        return Undefined();
      }
    }
  };
  return automatic_simplify(expression);
}

/**
 * Returns true if the given `expression` is a single-variable monomial
 * with respect to the given `variable`.
 */
function isMonomial1(expression: AlgebraicExpression, variable: string | Sym) {
  const x: Sym = $isString(variable) ? sym(variable) : variable;
  const monomial_sv = (u: AlgebraicExpression): boolean => {
    if (isInt(u) || isFrac(u)) {
      return true;
    } else if (u.equals(x)) {
      return true;
    } else if (isPower(u)) {
      const base = u.base;
      const exponent = u.exponent;
      if (base.equals(x) && isInt(exponent) && exponent.n > 1) {
        return true;
      }
    } else if (isProduct(u)) {
      const has_two_operands = u.numberOfOperands === 2;
      const operand1_is_monomial = monomial_sv(u.operand(1));
      const operand2_is_monomial = monomial_sv(u.operand(2));
      return (
        has_two_operands &&
        operand1_is_monomial &&
        operand2_is_monomial
      );
    }
    return false;
  };
  const exp = simplify(expression);
  return monomial_sv(exp);
}

// deno-fmt-ignore
enum tt {
  // Utility tokens - - - - - - - - - - - - - - - - - - - - - - - -
  
  /** A utility token indicating the end of input. */
  END,

  /** A utility token indicating an error. */
  ERROR,

  /** A utility token mapped to the empty token. */
  EMPTY,

  // Paired Delimiters - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"("` */
  lparen,

  /** Lexeme: `")"` */
  rparen,

  /** Lexeme: `"{"` */
  lbrace,

  /** Lexeme: `"}"` */
  rbrace,
  
  /** Lexeme: `"["` */
  lbracket,

  /** Lexeme: `"]"` */
  rbracket,
  
  // Strict Delimiters - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `";"` */
  semicolon,

  /** Lexeme: `":"` */
  colon,
  
  /** Lexeme: `"."` */
  dot,
  
  /** Lexeme: `","` */
  comma,

  // Operator delimiters - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"+"` */
  plus,
  
  /** Lexeme: `"-"` */
  minus,

  /** Lexeme: `"*"` */
  star,
  
  /** Lexeme: `"/"` */
  slash,
  
  /** Lexeme: `"^"` */
  caret,

  /** Lexeme: `"%"` */
  percent,
  
  /** Lexeme `"!"`. */
  bang,
  
  /** Lexeme: `"&"` */
  amp,
  
  /** Lexeme: `"~"` */
  tilde,
  
  /** Lexeme: `"|"` */
  vbar,
  
  /** Lexeme: `"="` */
  eq,
  
  /** Lexeme: `"<"` */
  lt,

  /** Lexeme: `">"` */
  gt,
  
  // Operative Dipthongs - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"!="` */
  neq,
  
  /** Lexeme: `"<="` */
  leq,
  
  /** Lexeme: `">="` */
  geq,
  
  /** Lexeme: `"=="` */
  deq,
  
  /** Lexeme: `"++"` */
  plus_plus,

  /** Lexeme: `"--"` */
  minus_minus,
  
  // Literals - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  symbol, string, bool,
  int, float, bignumber, bigfraction,
  scientific, fraction, nan, inf, nil,
  numeric_constant,
  algebra_string,
  
  // Vector operators
  /** Lexeme: `.+` - Vector addition */
  dot_add,
  /** Lexeme: `.*` - Vector multiplication */
  dot_star,
  /** Lexeme: `.-` - Vector difference */
  dot_minus,
  /** Lexeme: `.^` - Pairwise division */
  dot_caret,
  /** Lexeme: `@` - Dot product */
  
  // Matrix Operators
  /** Lexeme: `#+` - Matrix addition */
  /** Lexeme: `#-` - Matrix subtraction */
  /** Lexeme: `#*` - Matrix multiplication */

  // Native Calls - - - - - - - - - - - - - - - - - - - - - - - - - -
  native,

  // Keywords - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  and,or,not,nand,xor,xnor,nor, // Logical operators
  if,else, // predicators
  fn, // function declarative
  let, // variable declarative
  var,
  return, // return particle
  while, // while-loop particle
  for, // for-loop particle
  class, // struct declarative
  print, // print statement
  super,
  this,

  /* operator `"rem"` */
  rem,
  /* operator `"mod"` */
  mod,
  /* operator `"div"` */
  div,
}

// deno-fmt-ignore
type NumberTokenType = | tt.int | tt.float | tt.scientific | tt.bignumber | tt.bigfraction | tt.fraction;

// deno-fmt-ignore
type LIT = number | boolean | string | bigint | null | [number, number] | [ bigint, bigint] | Err;

type Location = { line: number; column: number };

const location = (line: number, column: number): Location => ({ line, column });

class Token<T extends tt = tt, L extends LIT = LIT, S extends string = string> {
  /** This token’s {@link tt|type}. */
  type: T;
  /** This token’s lexeme. */
  lexeme: S;
  /** This token’s literal value. */
  literal: L = null as any;
  /** The line where this token was recognized. */
  L: number;
  /** The column where this token was recognized. */
  C: number;
  loc(): Location {
    return location(this.L, this.C);
  }
  static empty: Token<tt, any> = new Token(tt.EMPTY, "", -1, -1);
  static END: Token<tt, any> = new Token(tt.END, "END", -1, -1);
  isEmpty() {
    return this.type === tt.EMPTY;
  }
  static of<X extends tt>(type: X, lexeme: string) {
    return new Token(type, lexeme, 0, 0);
  }
  guard<X extends tt, L extends LIT>(
    type: X,
    is: (literal: LIT) => literal is L,
  ): this is Token<X, L> {
    return (
      // @ts-ignore
      (this.type === type) && (is(this.literal))
    );
  }
  isArithmeticOperator(): this is Token<ArithmeticOperator> {
    return (
      this.type === tt.plus ||
      this.type === tt.star ||
      this.type === tt.caret ||
      this.type === tt.minus ||
      this.type === tt.rem ||
      this.type === tt.mod ||
      this.type === tt.percent ||
      this.type === tt.div
    );
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.type === types[i]) {
        return true;
      }
    }
    return false;
  }
  isAlgebraString(): this is Token<tt.algebra_string, string> {
    return (
      this.type === tt.algebra_string
    );
  }
  /**
   * Returns true if this token maps to the error token.
   */
  isError(): this is Token<tt.ERROR, Err> {
    return this.type === tt.ERROR;
  }
  isVariable(): this is Token<tt.symbol> {
    return (this.type === tt.symbol);
  }

  toString() {
    return this.lexeme;
  }

  is<x extends tt>(type: x): this is Token<x> {
    return (this.type === type as any);
  }

  constructor(
    type: T,
    lexeme: S,
    line: number,
    column: number,
    literal: L = null as any,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.L = line;
    this.C = column;
    this.literal = literal;
  }
  /**
   * Returns true if this token is a
   * right-delimiter token. That is,
   * either a `)`, `]`, or `}`.
   */
  isRPD() {
    return (
      this.type === tt.rparen ||
      this.type === tt.rbrace ||
      this.type === tt.rbracket
    );
  }
  /**
   * Sets this token’s lexeme.
   */
  lex(lexeme: string) {
    return new Token(
      this.type,
      lexeme,
      this.L,
      this.C,
      this.literal,
    );
  }
  /**
   * Sets this token’s type.
   */
  entype<X extends tt>(type: X) {
    return new Token(
      type,
      this.lexeme,
      this.L,
      this.C,
      this.literal,
    );
  }

  /**
   * Sets this token’s column.
   */
  encolumn(columnNumber: number) {
    return new Token(
      this.type,
      this.lexeme,
      this.L,
      columnNumber,
      this.literal,
    );
  }
  enline(lineNumber: number) {
    return new Token(
      this.type,
      this.lexeme,
      lineNumber,
      this.C,
      this.literal,
    );
  }
  lit<X extends LIT>(value: X) {
    return new Token(
      this.type,
      this.lexeme,
      this.L,
      this.C,
      value,
    );
  }
  /**
   * Returns true if this token maps
   * to `true` or `false`.
   */
  isBoolean(): this is Token<T, boolean> {
    return (
      $isBoolean(this.literal)
    );
  }
  /**
   * Returns true if this token maps
   * to an integer or float token.
   */
  isNumber(): this is Token<T, number> {
    return (
      $isNumber(this.literal)
    );
  }
  isNumLike() {
    return this.among([
      tt.int,
      tt.float,
      tt.bignumber,
      tt.bigfraction,
      tt.scientific,
      tt.fraction,
      tt.nan,
      tt.inf,
      tt.numeric_constant,
    ]);
  }
  /**
   * Returns true if this token maps
   * to a big integer token.
   */
  isBigNumber(): this is Token<T, bigint> {
    return (
      $isBigInt(this.literal)
    );
  }
  /**
   * Returns true if this token maps
   * to a big rational token.
   */
  isBigRational(): this is Token<tt.bigfraction, [bigint, bigint]> {
    return (
      this.type === tt.bigfraction
    );
  }
  /**
   * Returns true if this token maps
   * to a scientific number token.
   */
  isScientific(): this is Token<tt.scientific, [number, number]> {
    return (this.type === tt.scientific);
  }
  /**
   * Returns true if this token maps
   * to a fraction token.
   */
  isFraction(): this is Token<tt.fraction, [number, number]> {
    return (this.type === tt.fraction);
  }
  /**
   * Returns true if this token maps
   * to a big fraction token.
   */
  isBigFraction(): this is Token<tt.bigfraction, [bigint, bigint]> {
    return (this.type === tt.bigfraction);
  }
  /**
   * Returns a copy of this token.
   */
  copy() {
    const type = this.type;
    const lexeme = this.lexeme;
    const line = this.L;
    const literal = this.literal;
    const column = this.C;
    return new Token(type, lexeme, line, column, literal);
  }
}

/**
 * Returns a new token.
 * @parameter type - The token’s {@link tt|type}.
 * @parameter lexeme - The token’s lexeme.
 * @parameter line - The line where this token was recognized.
 * @parameter column - The column where this token was recognized.
 */
function token<X extends tt>(
  type: X,
  lexeme: string,
  line: number,
  column: number,
) {
  return new Token(type, lexeme, line, column);
}

function isLatinGreek(char: string) {
  return /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(char);
}

function isMathSymbol(char: string) {
  return /^[∀-⋿]/u.test(char);
}

function isValidName(char: string) {
  return (isLatinGreek(char) || isMathSymbol(char));
}

function isDigit(char: string) {
  return "0" <= char && char <= "9";
}

/**
 * Returns true if the given character is a greek letter name.
 */
function isGreekLetterName(c: string) {
  return /^(alpha|beta|gamma|delta|epsilon|zeta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|upsilon|phi|chi|psi|omega)/
    .test(c.toLowerCase());
}

enum bp {
  nil,
  lowest,
  stringop,
  assign,
  atom,
  or,
  nor,
  and,
  nand,
  xor,
  xnor,
  not,
  eq,
  rel,
  sum,
  difference,
  product,
  quotient,
  power,
  postfix,
  call,
}

type Parslet = (current: Token, lastNode: Expr) => Either<Err, Expr>;

type ParsletEntry = [Parslet, Parslet, bp];

type BPTable = Record<tt, ParsletEntry>;

class RETURN {
  value: Primitive;
  constructor(value: Primitive) {
    this.value = value;
  }
}

function returnValue(value: Primitive) {
  return new RETURN(value);
}

class Fn {
  private declaration: FnStmt;
  private closure: Environment<Primitive>;
  private isInitializer: boolean;
  constructor(
    declaration: FnStmt,
    closure: Environment<Primitive>,
    isInitializer: boolean,
  ) {
    this.declaration = declaration;
    this.closure = closure;
    this.isInitializer = isInitializer;
  }
  arity() {
    return this.declaration.params.length;
  }
  toString() {
    return `fn ${this.declaration.name}(...) {...}`;
  }
  bind(instance: Obj) {
    const environment = runtimeEnv(this.closure);
    environment.define("this", instance, true);
    return new Fn(this.declaration, environment, this.isInitializer);
  }
  call(interpreter: Compiler, args: Primitive[]) {
    const environment = runtimeEnv(this.closure);
    for (let i = 0; i < this.declaration.params.length; i++) {
      environment.define(
        this.declaration.params[i].name.lexeme,
        args[i],
        false,
      );
    }
    try {
      const out = interpreter.executeBlock(this.declaration.body, environment);
      if (this.isInitializer) {
        return this.closure.getAt(0, "this");
      }
      return out;
    } catch (E) {
      if (this.isInitializer) {
        return this.closure.getAt(0, "this");
      } else if (E instanceof RETURN) {
        return E.value;
      } else {
        throw E;
      }
    }
  }
}

function callable(
  declaration: FnStmt,
  closure: Environment<Primitive>,
  isInitializer: boolean,
) {
  return new Fn(declaration, closure, isInitializer);
}

function $isFn(x: any): x is Fn {
  return x instanceof Fn;
}

class Obj {
  private klass: Class;
  private fields: Map<string, Primitive>;
  constructor(klass: Class) {
    this.klass = klass;
    this.fields = new Map();
  }
  set(name: string, value: Primitive) {
    this.fields.set(name, value);
    return value;
  }
  get(name: Token): Primitive {
    if (this.fields.has(name.lexeme)) {
      return this.fields.get(name.lexeme)!;
    }
    const method = this.klass.findMethod(name.lexeme);
    if (method !== null) {
      return method.bind(this);
    }
    throw runtimeError(
      `User accessed a non-existent property “${name}”.`,
      `evaluating a property of “${this.klass.name}”`,
      name,
    );
  }
  toString() {
    return `${this.klass.name} instance`;
  }
}

function $isKlassInstance(x: any): x is Obj {
  return x instanceof Obj;
}

class Class {
  name: string;
  methods: Map<string, Fn>;
  constructor(name: string, methods: Map<string, Fn>) {
    this.name = name;
    this.methods = methods;
  }
  arity() {
    const initalizer = this.findMethod("def");
    if (initalizer === null) {
      return 0;
    }
    return initalizer.arity();
  }
  findMethod(name: string) {
    if (this.methods.has(name)) {
      return this.methods.get(name)!;
    }
    return null;
  }
  call(interpreter: Compiler, args: Primitive[]) {
    const instance = new Obj(this);
    const initializer = this.findMethod("def");
    if (initializer !== null) {
      initializer.bind(instance).call(interpreter, args);
    }
    return instance;
  }
  toString() {
    return this.name;
  }
}

function $isKlass(x: any): x is Class {
  return x instanceof Class;
}

function klassObj(name: string, methods: Map<string, Fn>) {
  return new Class(name, methods);
}

interface Resolvable<X = any> {
  resolve(expr: Expr, i: number): X;
}

enum function_type {
  none,
  function,
  method,
  initializer,
}

enum class_type {
  none,
  class,
}

class Resolver<T extends Resolvable = Resolvable> implements Visitor<void> {
  private scopes: (Map<string, boolean>)[] = [];
  private scopesIsEmpty() {
    return this.scopes.length === 0;
  }
  private currentFunction: function_type = function_type.none;
  private currentClass: class_type = class_type.none;
  private beginScope() {
    this.scopes.push(new Map());
  }
  private endScope() {
    this.scopes.pop();
  }
  private resolveEach(nodes: ASTNode[]) {
    for (let i = 0; i < nodes.length; i++) {
      this.resolve(nodes[i]);
    }
    return;
  }
  private resolve(node: ASTNode) {
    node.accept(this);
  }
  private peek(): Map<string, boolean> {
    return this.scopes[this.scopes.length - 1];
  }
  indexingExpr(node: IndexingExpr) {
    this.resolve(node.list);
    this.resolve(node.index);
    return;
  }
  algebraicString(node: AlgebraicString): void {
    return;
  }
  private declare(name: Token) {
    if (this.scopes.length === 0) return;
    const scope = this.peek();
    if (scope.has(name.lexeme)) {
      throw resolverError(
        `Encountered a name collision. The variable “${name.lexeme}” has already been declared in the current scope.`,
        `resolving a declaration`,
        name,
      );
    }
    scope.set(name.lexeme, false);
  }

  private define(name: string) {
    if (this.scopes.length === 0) return;
    const peek = this.peek();
    peek.set(name, true);
  }

  private resolveFn(node: FnStmt, type: function_type) {
    const enclosingFunction = this.currentFunction;
    this.currentFunction = type;
    this.beginScope();
    for (let i = 0; i < node.params.length; i++) {
      this.declare(node.params[i].name);
      this.define(node.params[i].name.lexeme);
    }
    this.resolveEach(node.body);
    this.endScope();
    this.currentFunction = enclosingFunction;
  }

  resolveLocal(node: Expr, name: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const scope = this.scopes[i];
      if (scope !== undefined && scope.has(name)) {
        this.client.resolve(node, this.scopes.length - 1 - i);
        return;
      }
    }
  }
  client: T;
  constructor(client: T) {
    this.client = client;
  }
  thisExpr(node: ThisExpr): void {
    if (this.currentClass === class_type.none) {
      throw resolverError(
        `Encountered the keyword “this” outside of a class definition. This syntax has no semantic, since “this” points to nothing.`,
        `resolving “this”`,
        node.keyword,
      );
    }
    this.resolveLocal(node, "this");
    return;
  }
  superExpr(node: SuperExpr): void {
    throw new Error(`superExpr not implemented`);
  }
  setExpr(node: SetExpr): void {
    this.resolve(node.value);
    this.resolve(node.object);
    return;
  }
  getExpr(node: GetExpr): void {
    this.resolve(node.object);
    return;
  }
  integer(node: Integer): void {
    return;
  }
  numericConstant(node: NumericConstant): void {
    return;
  }
  vectorExpr(node: VectorExpr): void {
    this.resolveEach(node.elements);
    return;
  }
  matrixExpr(node: MatrixExpr): void {
    this.resolveEach(node.vectors);
    return;
  }
  bigNumber(node: BigNumber): void {
    return;
  }
  fractionExpr(node: FractionExpr): void {
    return;
  }
  bigRational(node: RationalExpr): void {
    return;
  }
  float(node: Float): void {
    return;
  }
  bool(node: Bool): void {
    return;
  }
  tupleExpr(node: TupleExpr): void {
    this.resolveEach(node.elements);
    return;
  }
  string(node: StringLiteral): void {
    return;
  }
  nil(node: Nil): void {
    return;
  }
  variable(node: Variable): void {
    const name = node.name;
    if (!this.scopesIsEmpty() && this.peek().get(name.lexeme) === false) {
      throw resolverError(
        `The user is attempting to read the variable “${node.name}” from its own initializer. This syntax has no semantic.`,
        `resolving the variable ${node.name}`,
        node.name,
      );
    }
    this.resolveLocal(node, node.name.lexeme);
    return;
  }
  assignExpr(node: AssignExpr): void {
    this.resolve(node.value);
    this.resolveLocal(node, node.name.lexeme);
    return;
  }
  stringBinaryExpr(node: StringBinaryExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  vectorBinaryExpr(node: VectorBinaryExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): void {
    this.resolve(node.arg);
    return;
  }
  logicalBinaryExpr(node: LogicalBinaryExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  logicalUnaryExpr(node: LogicalUnaryExpr): void {
    this.resolve(node.arg);
    return;
  }
  relationalExpr(node: RelationalExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  callExpr(node: CallExpr): void {
    this.resolve(node.callee);
    this.resolveEach(node.args);
    return;
  }
  nativeCall(node: NativeCall): void {
    this.resolveEach(node.args);
    return;
  }
  groupExpr(node: GroupExpr): void {
    this.resolve(node.expression);
    return;
  }
  blockStmt(node: BlockStmt): void {
    this.beginScope();
    this.resolveEach(node.statements);
    this.endScope();
    return;
  }
  exprStmt(node: ExprStmt): void {
    this.resolve(node.expression);
    return;
  }
  classStmt(node: ClassStmt): void {
    const enclosingClass = this.currentClass;
    this.currentClass = class_type.class;
    this.declare(node.name);
    this.define(node.name.lexeme);
    this.beginScope();
    const peek = this.peek();
    peek.set("this", true);
    const methods = node.methods;
    for (let i = 0; i < methods.length; i++) {
      const method = methods[i];
      let declaration = function_type.method;
      if (method.name.lexeme === "init") {
        declaration = function_type.initializer;
      }
      this.resolveFn(method, declaration);
    }
    this.endScope();
    this.currentClass = enclosingClass;
    return;
  }
  fnStmt(node: FnStmt): void {
    this.declare(node.name);
    this.define(node.name.lexeme);
    this.resolveFn(node, function_type.function);
    return;
  }
  ifStmt(node: IfStmt): void {
    this.resolve(node.condition);
    this.resolve(node.then);
    this.resolve(node.alt);
    return;
  }
  printStmt(node: PrintStmt): void {
    this.resolve(node.expression);
    return;
  }
  returnStmt(node: ReturnStmt): void {
    if (this.currentFunction === function_type.none) {
      throw resolverError(
        `Encountered the “return” keyword at the top-level. This syntax has no semantic.`,
        `resolving a return-statement`,
        node.keyword,
      );
    }
    if (this.currentFunction === function_type.initializer) {
      throw resolverError(
        `Encounterd the “return” keyword within an initializer.`,
        `resolving a return-statement`,
        node.keyword,
      );
    }
    this.resolve(node.value);
    return;
  }
  letStmt(node: VariableStmt): void {
    this.declare(node.name);
    this.resolve(node.value);
    this.define(node.name.lexeme);
    return;
  }
  whileStmt(node: WhileStmt): void {
    this.resolve(node.condition);
    this.resolve(node.body);
  }
  resolved(statements: Statement[]) {
    try {
      for (let i = 0; i < statements.length; i++) {
        this.resolve(statements[i]);
      }
      return right(1);
    } catch (error) {
      return left(error as Err);
    }
  }
}

function resolvable(client: Resolvable) {
  return new Resolver(client);
}

class Environment<T> {
  values: Map<string, T>;
  enclosing: Environment<T> | null;
  mutables: Set<string>;
  constructor(enclosing: Environment<T> | null) {
    this.values = new Map<string, T>();
    this.enclosing = enclosing;
    this.mutables = new Set();
  }
  ancestor(distance: number) {
    // @ts-ignore
    let env = this;
    for (let i = 0; i < distance; i++) {
      // @ts-ignore
      env = this.enclosing;
    }
    return env;
  }
  assignAt(distance: number, name: string, value: T): T {
    this.ancestor(distance).values.set(name, value);
    return value;
  }
  getAt(distance: number, name: string): T {
    return this.ancestor(distance).values.get(name)!;
  }
  /**
   * Assigns a new value to the given name.
   * If no such name exists, throws a new resolver error.
   * The name provided must be a {@link Token|token} to
   * ensure line and column numbers are reported.
   */
  assign(name: Token, value: T): T {
    if (this.values.has(name.lexeme)) {
      if (this.mutables.has(name.lexeme)) {
        this.values.set(name.lexeme, value);
        return value;
      }
      throw envError(
        `The variable “${name.lexeme}” is not a mutable variable.`,
        `assigning a new value to a variable`,
        name,
        `Declare “${name.lexeme}” with “var”.`,
      );
    }
    if (this.enclosing !== null) {
      return this.enclosing.assign(name, value);
    }
    throw envError(
      `The variable “${name.lexeme}” is not defined and only defined variables may be assigned.`,
      `assigning a new value to a variable`,
      name,
      `define ${name.lexeme} with “let” or “var” before line ${name.L}.`,
    );
  }
  /**
   * Binds a new value to the given name.
   */
  define(name: string, value: T, mutable: boolean): T {
    this.values.set(name, value);
    if (mutable) {
      this.mutables.add(name);
    }
    return value;
  }
  /**
   * Retrieves the value bound to the given name.
   * If no such name exists, throws a new resolver error.
   * The name provided must be a {@link Token|token} to ensure
   * line and column numbers are reported.
   */
  get(name: Token): T {
    if (this.values.has(name.lexeme)) {
      return this.values.get(name.lexeme)!;
    }
    if (this.enclosing !== null) {
      return this.enclosing.get(name);
    }
    throw envError(
      `The variable “${name.lexeme}” is not defined, and only defined variables may be read.`,
      `reading a variable`,
      name,
      `Declare “${name.lexeme}” with “let” or “var” before usage.`,
    );
  }
}

function runtimeEnv(enclosing: Environment<Primitive> | null) {
  return new Environment<Primitive>(enclosing);
}

// deno-fmt-ignore
type Primitive = | number | boolean | null | string | bigint | Fraction | BigRat | Vector | Matrix | Fn | Class | Obj | Primitive[] | AlgebraicExpression;

function stringify(value: Primitive): string {
  if (value === null) {
    return `nil`;
  } else if (value === undefined) {
    return `undefined`;
  } else if ($isArray(value)) {
    const elems = value.map((v) => stringify(v)).join(", ");
    return `(${elems})`;
  } else if ($isNumber(value)) {
    if ($isNaN(value)) {
      return `NaN`;
    } else if ($isInfinity(value)) {
      return `Inf`;
    } else if ($isInt(value)) {
      return `${value}`;
    } else {
      return `${value}`;
    }
  } else {
    return value.toString();
  }
}

function truthy(x: Primitive) {
  if ($isBoolean(x)) return x;
  if ($isArray(x) || $isString(x)) return x.length !== 0;
  if (x === null || x === undefined) return false;
  if (x instanceof BigRat || x instanceof Fraction) return !x.isZero;
  if (x instanceof Vector) return x.length !== 0;
  if (x instanceof Matrix) return x.R !== 0 && x.C !== 0;
  return (
    x !== 0 &&
    !Number.isNaN(x) &&
    true
  );
}

class Simplifier implements Visitor<AlgebraicExpression> {
  op: Token;
  place(op: Token) {
    this.op = op;
    return this;
  }
  constructor(op: Token) {
    this.op = op;
  }
  private unsupportedError(nodetype: string) {
    return this.error(`${nodetype} cannot be used in algebraic strings.`);
  }
  private error(message: string) {
    return algebraError(
      message,
      "transforming to an algebraic expression",
      this.op,
    );
  }
  vectorBinaryExpr(node: VectorBinaryExpr): AlgebraicExpression {
    throw this.unsupportedError("Vector binary expressions");
  }
  reduce(node: ASTNode) {
    return node.accept(this);
  }
  reduceEach(nodes: ASTNode[]) {
    const args = [];
    for (let i = 0; i < nodes.length; i++) {
      args.push(this.reduce(nodes[i]));
    }
    return args;
  }
  integer(node: Integer): AlgebraicExpression {
    return int(node.value);
  }
  numericConstant(node: NumericConstant): AlgebraicExpression {
    if (node.sym === "NAN") {
      throw this.unsupportedError("NAN");
    } else {
      return constant(node.sym, node.value);
    }
  }
  vectorExpr(node: VectorExpr): AlgebraicExpression {
    throw this.unsupportedError(`Vectors`);
  }
  matrixExpr(node: MatrixExpr): AlgebraicExpression {
    throw this.unsupportedError(`Matrices`);
  }
  indexingExpr(node: IndexingExpr): AlgebraicExpression {
    throw this.unsupportedError(`Indexing expressions`);
  }
  bigNumber(node: BigNumber): AlgebraicExpression {
    throw this.unsupportedError(`Big numbers`);
  }
  fractionExpr(node: FractionExpr): AlgebraicExpression {
    return frac(node.value.n, node.value.d);
  }
  bigRational(node: RationalExpr): AlgebraicExpression {
    throw this.unsupportedError(`Big rationals`);
  }
  float(node: Float): AlgebraicExpression {
    return real(node.value);
  }
  bool(node: Bool): AlgebraicExpression {
    throw this.unsupportedError(`Booleans`);
  }
  tupleExpr(node: TupleExpr): AlgebraicExpression {
    throw this.unsupportedError(`Tuples`);
  }
  getExpr(node: GetExpr): AlgebraicExpression {
    throw this.unsupportedError(`Get expressions`);
  }
  setExpr(node: SetExpr): AlgebraicExpression {
    throw this.unsupportedError(`Set expressions`);
  }
  superExpr(node: SuperExpr): AlgebraicExpression {
    throw this.unsupportedError(`Super expressions`);
  }
  thisExpr(node: ThisExpr): AlgebraicExpression {
    throw this.unsupportedError(`This expressions`);
  }
  string(node: StringLiteral): AlgebraicExpression {
    throw this.unsupportedError(`Strings expressions`);
  }
  algebraicString(node: AlgebraicString): AlgebraicExpression {
    throw this.error(`Algebraic strings cannot be used within themselves`);
  }
  nil(node: Nil): AlgebraicExpression {
    return Undefined();
  }
  variable(node: Variable): AlgebraicExpression {
    return sym(node.name.lexeme);
  }
  assignExpr(node: AssignExpr): AlgebraicExpression {
    throw this.unsupportedError(`Assignment expressions`);
  }
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): AlgebraicExpression {
    const left = this.reduce(node.left);
    const right = this.reduce(node.right);
    const op = node.op.type;
    switch (op) {
      case tt.caret: {
        return power(left, right);
      }
      case tt.plus: {
        return sum([left, right]);
      }
      case tt.minus: {
        return difference(left, right);
      }
      case tt.star: {
        return product([left, right]);
      }
      case tt.slash: {
        return quotient(left, right);
      }
    }
    const lexeme = node.op.lexeme;
    throw this.error(
      `The “${lexeme}” operator is not supported in algebraic expressions`,
    );
  }
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): AlgebraicExpression {
    const arg = this.reduce(node.arg);
    const op = node.op.type;
    switch (op) {
      case tt.plus: {
        return sum([arg]);
      }
      case tt.minus: {
        if (isInt(arg) || isReal(arg)) {
          return int(-arg.n);
        } else {
          return product([int(-1), arg]);
        }
      }
      case tt.bang: {
        return factorial(arg);
      }
    }
  }
  stringBinaryExpr(node: StringBinaryExpr): AlgebraicExpression {
    throw this.unsupportedError(`String binary expressions`);
  }
  logicalBinaryExpr(node: LogicalBinaryExpr): AlgebraicExpression {
    throw this.unsupportedError(`Logical binary expressions`);
  }
  logicalUnaryExpr(node: LogicalUnaryExpr): AlgebraicExpression {
    throw this.unsupportedError(`Logical unary expressions`);
  }
  relationalExpr(node: RelationalExpr): AlgebraicExpression {
    throw this.unsupportedError(`Relational expressions`);
  }
  callExpr(node: CallExpr): AlgebraicExpression {
    throw this.unsupportedError(`User defined functions`);
  }
  nativeCall(node: NativeCall): AlgebraicExpression {
    const args = this.reduceEach(node.args);
    if (args.length === 0) {
      throw this.error(`Encountered a native call with no arguments.`);
    }
    const name = node.name.lexeme;
    switch (name) {
      case "deriv": {
        const expr = args[0];
        const variable = args[1];
        if (variable === undefined || !isSymbol(variable)) {
          throw this.error(
            `Derivatives require a second symbol parameter.\n I.e., the derivative with respect to what variable?`,
          );
        } else {
          return derivative(expr, variable);
        }
      }
      case "simplify": {
        return simplify(args[0]);
      }
      default: {
        return fn(name, args);
      }
    }
  }
  groupExpr(node: GroupExpr): AlgebraicExpression {
    const out = this.reduce(node.expression);
    out.tickParen();
    return out;
  }
  blockStmt(node: BlockStmt): AlgebraicExpression {
    throw this.unsupportedError(`Block statements`);
  }
  exprStmt(node: ExprStmt): AlgebraicExpression {
    throw this.unsupportedError(`Expression statements`);
  }
  fnStmt(node: FnStmt): AlgebraicExpression {
    throw this.unsupportedError(`Function declarations`);
  }
  ifStmt(node: IfStmt): AlgebraicExpression {
    throw this.unsupportedError(`If statements`);
  }
  classStmt(node: ClassStmt): AlgebraicExpression {
    throw this.unsupportedError(`Class statements`);
  }
  printStmt(node: PrintStmt): AlgebraicExpression {
    throw this.unsupportedError(`Print statements`);
  }
  returnStmt(node: ReturnStmt): AlgebraicExpression {
    throw this.unsupportedError(`Return statements`);
  }
  letStmt(node: VariableStmt): AlgebraicExpression {
    throw this.unsupportedError(`Let statements`);
  }
  whileStmt(node: WhileStmt): AlgebraicExpression {
    throw this.unsupportedError(`While statements`);
  }
}

const latex = {
  esc: (s: string | number) => `\\${s}`,
  text: (s: string | number) => `\\text{${s}}`,
  texttt: (s: string | number) => `\\texttt{${s}}`,
  mathbb: (s: string | number) => `\\mathbb{${s}}`,
  parend: (s: string | number) => `\\left(${s}\\right)`,
  bracketed: (s: string | number) => `\\left[${s}\\right]`,
};

class Latexer implements Visitor<string> {
  latexOf(node: ASTNode) {
    return node.accept(this);
  }
  integer(node: Integer): string {
    return node.toString();
  }
  numericConstant(node: NumericConstant): string {
    switch (node.sym) {
      case "Inf":
        return latex.esc("infty");
      case "NAN":
        return latex.text("NAN");
      case "e":
        return "e";
      case "pi":
        return latex.esc("pi");
    }
  }
  vectorExpr(node: VectorExpr): string {
    const out = node.elements.map((e) => this.latexOf(e)).join("");
    return latex.bracketed(out);
  }
  vectorBinaryExpr(node: VectorBinaryExpr): string {
    return node.toString();
  }
  matrixExpr(node: MatrixExpr): string {
    throw new Error("Method not implemented.");
  }
  indexingExpr(node: IndexingExpr): string {
    throw new Error("Method not implemented.");
  }
  bigNumber(node: BigNumber): string {
    throw new Error("Method not implemented.");
  }
  fractionExpr(node: FractionExpr): string {
    throw new Error("Method not implemented.");
  }
  bigRational(node: RationalExpr): string {
    throw new Error("Method not implemented.");
  }
  float(node: Float): string {
    throw new Error("Method not implemented.");
  }
  bool(node: Bool): string {
    throw new Error("Method not implemented.");
  }
  tupleExpr(node: TupleExpr): string {
    throw new Error("Method not implemented.");
  }
  getExpr(node: GetExpr): string {
    throw new Error("Method not implemented.");
  }
  setExpr(node: SetExpr): string {
    throw new Error("Method not implemented.");
  }
  superExpr(node: SuperExpr): string {
    throw new Error("Method not implemented.");
  }
  thisExpr(node: ThisExpr): string {
    throw new Error("Method not implemented.");
  }
  string(node: StringLiteral): string {
    throw new Error("Method not implemented.");
  }
  stringBinaryExpr(node: StringBinaryExpr): string {
    throw new Error("Method not implemented.");
  }
  algebraicString(node: AlgebraicString): string {
    throw new Error("Method not implemented.");
  }
  nil(node: Nil): string {
    throw new Error("Method not implemented.");
  }
  variable(node: Variable): string {
    throw new Error("Method not implemented.");
  }
  assignExpr(node: AssignExpr): string {
    throw new Error("Method not implemented.");
  }
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): string {
    throw new Error("Method not implemented.");
  }
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): string {
    throw new Error("Method not implemented.");
  }
  logicalBinaryExpr(node: LogicalBinaryExpr): string {
    throw new Error("Method not implemented.");
  }
  logicalUnaryExpr(node: LogicalUnaryExpr): string {
    throw new Error("Method not implemented.");
  }
  relationalExpr(node: RelationalExpr): string {
    throw new Error("Method not implemented.");
  }
  callExpr(node: CallExpr): string {
    throw new Error("Method not implemented.");
  }
  nativeCall(node: NativeCall): string {
    throw new Error("Method not implemented.");
  }
  groupExpr(node: GroupExpr): string {
    throw new Error("Method not implemented.");
  }
  blockStmt(node: BlockStmt): string {
    throw new Error("Method not implemented.");
  }
  exprStmt(node: ExprStmt): string {
    throw new Error("Method not implemented.");
  }
  fnStmt(node: FnStmt): string {
    throw new Error("Method not implemented.");
  }
  ifStmt(node: IfStmt): string {
    throw new Error("Method not implemented.");
  }
  classStmt(node: ClassStmt): string {
    throw new Error("Method not implemented.");
  }
  printStmt(node: PrintStmt): string {
    throw new Error("Method not implemented.");
  }
  returnStmt(node: ReturnStmt): string {
    throw new Error("Method not implemented.");
  }
  letStmt(node: VariableStmt): string {
    throw new Error("Method not implemented.");
  }
  whileStmt(node: WhileStmt): string {
    throw new Error("Method not implemented.");
  }
}

class Compiler implements Visitor<Primitive> {
  environment: Environment<Primitive>;
  globals: Environment<Primitive>;
  locals: Map<Expr, number>;
  mode: "log" | "exec" = "exec";
  prints: string[] = [];
  simplifier: Simplifier;
  evaluate(node: ASTNode): Primitive {
    return node.accept(this);
  }
  setmode(mode: "log" | "exec") {
    this.mode = mode;
    return this;
  }
  constructor() {
    this.globals = runtimeEnv(null);
    this.environment = this.globals;
    this.locals = new Map();
    this.simplifier = new Simplifier(Token.empty);
  }
  vectorBinaryExpr(node: VectorBinaryExpr): Primitive {
    const op = node.op;
    const left = this.evaluate(node.left);
    const right = this.evaluate(node.right);
    if (!$isVector(left) || !$isVector(right)) {
      throw runtimeError(
        `The operator “${node.op.lexeme}” is restricted to vectors`,
        "interpreting an infix vector expression",
        op,
      );
    }
    switch (op.type) {
      case tt.dot_add: {
        return left.add(right);
      }
      case tt.dot_minus: {
        return left.sub(right);
      }
      case tt.dot_star: {
        return left.mul(right);
      }
      case tt.dot_caret: {
        return left.pow(right);
      }
    }
  }
  algebraicString(node: AlgebraicString): Primitive {
    const expression = node.expression;
    return this.simplifier.place(node.op).reduce(expression);
  }
  lookupVariable(name: Token, expr: Expr) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.environment.getAt(distance, name.lexeme);
    } else {
      return this.globals.get(name);
    }
  }
  indexingExpr(node: IndexingExpr) {
    const L = this.evaluate(node.list);
    const I = this.evaluate(node.index) as number;
    if (!$isNumber(I)) {
      throw runtimeError(
        `Expected a number index, but got “${stringify(I)}”`,
        `evaluating an index expression`,
        node.op,
      );
    }
    if ($isVector(L) || $isMatrix(L)) {
      const out = L.element(I);
      if (out === null) {
        throw runtimeError(
          `Encountered an out-of-bounds index.\nThe provided index exceeds the length of the targeted sequential.`,
          `evaluating an indexing expression`,
          node.op,
          "Ensure the index value is less than the sequential’s length.",
        );
      } else {
        return out;
      }
    } else if ($isArray(L)) {
      const out = L[I - 1];
      if (out === undefined) {
        return null;
      } else {
        return out;
      }
    } else {
      throw runtimeError(
        `Expected a sequential for indexing, but got “${stringify(L)}”`,
        `evaluating an indexing expression`,
        node.op,
      );
    }
  }
  resolve(expression: Expr, depth: number) {
    this.locals.set(expression, depth);
  }
  thisExpr(node: ThisExpr): Primitive {
    return this.lookupVariable(node.keyword, node);
  }
  stringBinaryExpr(node: StringBinaryExpr): Primitive {
    const left = stringify(this.evaluate(node.left));
    const right = stringify(this.evaluate(node.right));
    const op = node.op.type;
    switch (op) {
      case tt.amp:
        return left + right;
    }
  }
  superExpr(node: SuperExpr): Primitive {
    throw new Error(`superExpr not implemented`);
  }
  setExpr(node: SetExpr): Primitive {
    const obj = this.evaluate(node.object);
    if (!$isKlassInstance(obj)) {
      throw runtimeError(
        `Only instances have fields`,
        `interpreting a field set`,
        node.name,
      );
    }
    const value = this.evaluate(node.value);
    return obj.set(node.name.lexeme, value);
  }
  getExpr(node: GetExpr): Primitive {
    const obj = this.evaluate(node.object);
    if ($isKlassInstance(obj)) {
      return obj.get(node.name);
    }
    throw runtimeError(
      `Properties only exist on instances of classes. “${
        stringify(obj)
      }” is not a class instance.`,
      `interpreting a property access`,
      node.name,
    );
  }
  matrixExpr(node: MatrixExpr): Primitive {
    const vectors = node.vectors.map((v) => this.evaluate(v)) as Vector[];
    return new Matrix(vectors, node.rows, node.cols);
  }
  vectorExpr(node: VectorExpr): Vector {
    const nums: number[] = [];
    const elements = node.elements;
    for (let i = 0; i < elements.length; i++) {
      const n = this.evaluate(elements[i]);
      if (typeof n !== "number") {
        throw runtimeError(
          `Vectors must only contain either numbers or expressions that reduce to numbers. The value ${
            stringify(n)
          } is not a number.`,
          `interpreting a vector expression`,
          node.op,
        );
      }
      nums.push(n);
    }
    return vector(nums);
  }

  integer(node: Integer): Primitive {
    return node.value;
  }
  numericConstant(node: NumericConstant): Primitive {
    return node.value;
  }
  bigNumber(node: BigNumber): Primitive {
    return node.value;
  }
  fractionExpr(node: FractionExpr): Primitive {
    return node.value;
  }
  bigRational(node: RationalExpr): Primitive {
    return node.value;
  }
  float(node: Float): Primitive {
    return node.value;
  }
  bool(node: Bool): Primitive {
    return node.value;
  }
  tupleExpr(node: TupleExpr): Primitive {
    const elements = node.elements.map((e) => this.evaluate(e));
    return elements;
  }
  string(node: StringLiteral): Primitive {
    return node.value;
  }
  nil(node: Nil): Primitive {
    return node.value;
  }
  variable(node: Variable): Primitive {
    return this.lookupVariable(node.name, node);
  }
  assignExpr(node: AssignExpr): Primitive {
    const value = this.evaluate(node.value);
    const distance = this.locals.get(node);
    if (distance !== undefined) {
      this.environment.assignAt(distance, node.name.lexeme, value);
    } else {
      this.globals.assign(node.name, value);
    }
    return value;
  }
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): Primitive {
    let L = this.evaluate(node.left) as any;
    let R = this.evaluate(node.right) as any;
    const op = node.op.type;
    if (($isNumber(L) && $isFraction(R)) || ($isNumber(R) && $isFraction(L))) {
      L = Fraction.from(L);
      R = Fraction.from(R);
    }
    if ($isFraction(L) && $isFraction(R)) {
      // deno-fmt-ignore
      switch (op) {
        case tt.star: return L.times(R);
        case tt.slash: return L.div(R);
        case tt.plus: return L.add(R);
        case tt.minus: return L.sub(R);
        case tt.percent: return percent(L.asFloat(), R.asFloat());
        case tt.rem: return (L.asInt()) % (R.asInt());
        case tt.mod: return mod(L.asInt(), R.asInt());
        case tt.div: return floor(L.asInt()/R.asInt());
        case tt.caret: return (L.asInt() ** R.asInt());
      }
    }
    // deno-fmt-ignore
    switch (op) {
      case tt.plus: return L + R;
      case tt.star: return L * R;
      case tt.caret: return L ** R;
      case tt.slash: return L / R;
      case tt.minus: return L - R;
      case tt.rem: return L % R;
      case tt.mod: return mod(L, R);
      case tt.percent: return percent(L, R);
      case tt.div: return floor(L / R);
    }
  }
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): Primitive {
    const arg = this.evaluate(node.arg) as any;
    const op = node.op.type;
    if ($isFraction(arg)) {
      // deno-fmt-ignore
      switch (op) {
        case tt.plus: return arg.pos();
        case tt.minus: return arg.neg();
        case tt.bang: {
          throw runtimeError(
            `The factorial operation is not defined on rationals`,
            `interpreting a factorial expression`,
						node.op,
          )
        }
      }
    }
    // deno-fmt-ignore
    switch (op) {
      case tt.plus: return +arg;
      case tt.minus: return -arg;
      case tt.bang: return factorialize(arg);
    }
  }
  logicalBinaryExpr(node: LogicalBinaryExpr): Primitive {
    const L = truthy(this.evaluate(node.left));
    const R = truthy(this.evaluate(node.right));
    const op = node.op.type;

    // deno-fmt-ignore
    switch (op) {
      case tt.and: return L && R;
      case tt.or: return L || R;
      case tt.nand: return !(L && R);
      case tt.nor: return !(L||R);
      case tt.xnor: return L === R;
      case tt.xor: return L !== R;
    }
  }
  logicalUnaryExpr(node: LogicalUnaryExpr): Primitive {
    const arg = this.evaluate(node.arg);
    return !(truthy(arg));
  }
  relationalExpr(node: RelationalExpr): Primitive {
    let L = this.evaluate(node.left) as any;
    let R = this.evaluate(node.right) as any;
    const op = node.op.type;
    if (($isNumber(L) && $isFraction(R)) || ($isNumber(R) && $isFraction(L))) {
      L = Fraction.from(L);
      R = Fraction.from(R);
    }
    if ($isFraction(L) && $isFraction(R)) {
      // deno-fmt-ignore
      switch (op) {
        case tt.lt: return L.lt(R);
        case tt.gt: return L.gt(R);
        case tt.deq: return L.equals(R);
        case tt.neq: return !L.equals(R);
        case tt.geq: return L.geq(R);
        case tt.leq: return L.leq(R);
      }
    }
    // deno-fmt-ignore
    switch (op) {
      case tt.lt: return L < R;
      case tt.gt: return L > R;
      case tt.deq: return L === R;
      case tt.neq: return L !== R;
      case tt.geq: return L >= R;
      case tt.leq: return L <= R;
    }
  }
  groupExpr(node: GroupExpr): Primitive {
    return this.evaluate(node.expression);
  }
  callExpr(node: CallExpr): Primitive {
    const callee = this.evaluate(node.callee);
    const args: Primitive[] = [];
    for (let i = 0; i < node.args.length; i++) {
      args.push(this.evaluate(node.args[i]));
    }
    if ($isKlass(callee)) {
      return callee.call(this, args);
    }
    if ($isFn(callee)) {
      return callee.call(this, args);
    }
    // deno-fmt-ignore
    throw runtimeError(
      `“${stringify(callee)}” is neither a function nor a class. Only functions and classes may be called.`,
      `evaluating a call expression`,
			node.paren
    );
  }
  nativeCall(node: NativeCall): Primitive {
    const val = node.args.map((v) => this.evaluate(v)) as any[];
    // deno-fmt-ignore
    switch (node.name.lexeme) {
      case 'deriv': {
        const arg = val[0];
        let x = val[1];
        if ($isString(x)) {
          x = sym(x);
        }
        if (!(arg instanceof AlgebraicExpression)) {
          throw runtimeError(
            `Only algebraic expressions may be passed to “deriv”`,
            `evaluating a native call`,
						node.name,
          )
        }
        if (!isSymbol(x)) {
          throw runtimeError(
            `“deriv” requires a symbol as its second argument`,
            `evaluating a native call`,
						node.name,
          )
        }
        return derivative(arg, x)
      }
      case 'gcd': {
        const a = floor(val[0]);
        const b = floor(val[1]);
        return gcd(a,b);
      }
      case 'simplify': {
        const arg = val[0];
        if (!(arg instanceof AlgebraicExpression)) {
          throw runtimeError(
            `Only algebraic expressions may be passed to “simplify”`,
            `evaluating a native call`,
						node.name,
          )
        }
        return simplify(arg);
      }
      case 'subex': {
        if (!(val[0] instanceof AlgebraicExpression)) {
          throw runtimeError(
            `subex may only be called with an algebraic expressions`,
            `evaluating a native call`,
						node.name,
          )
        }
        return subex(val[0]);
      }
      case "!": return factorialize(val[0]);
      case 'tanh': return tanh(val[0]);
      case 'sqrt': return sqrt(val[0]);
      case 'sinh': return sinh(val[0]);
      case 'exp': return exp(val[0]);
      case 'cosh': return cosh(val[0]);
      case 'floor': return floor(val[0]);
      case 'ceil': return ceil(val[0]);
      case 'arctan': return arctan(val[0]);
      case 'arcsinh': return arcsinh(val[0]);
      case 'arcsin': return arcsin(val[0]);
      case 'arccosh': return arccosh(val[0]);
      case 'arccos': return arccos(val[0]);
      case "cos": return cos(val[0]);
      case "sin": return sin(val[0]);
      case "tan": return tan(val[0]);
      case "lg": return lg(val[0]);
      case 'ln': return ln(val[0]);
      case 'log': return log(val[0]);
      case 'max': return max(...val);
      case 'min': return min(...val);
      case 'avg': return avg(...val);
    }
  }
  executeBlock(statements: Statement[], environment: Environment<Primitive>) {
    const previous = this.environment;
    try {
      this.environment = environment;
      let result: Primitive = null;
      const L = statements.length;
      for (let i = 0; i < L; i++) {
        result = this.evaluate(statements[i]);
      }
      return result;
    } finally {
      this.environment = previous;
    }
  }
  classStmt(node: ClassStmt): Primitive {
    this.environment.define(node.name.lexeme, null, true);
    const methods = new Map<string, Fn>();
    for (let i = 0; i < node.methods.length; i++) {
      const method = node.methods[i];
      const f = callable(
        method,
        this.environment,
        method.name.lexeme === "init",
      );
      methods.set(method.name.lexeme, f);
    }
    const klass = klassObj(node.name.lexeme, methods);
    this.environment.assign(node.name, klass);
    return null;
  }
  blockStmt(node: BlockStmt): Primitive {
    const env = runtimeEnv(this.environment);
    return this.executeBlock(node.statements, env);
  }
  exprStmt(node: ExprStmt): Primitive {
    return this.evaluate(node.expression);
  }
  fnStmt(node: FnStmt): Primitive {
    const f = callable(node, this.environment, false);
    this.environment.define(node.name.lexeme, f, false);
    return null;
  }
  ifStmt(node: IfStmt): Primitive {
    if (truthy(this.evaluate(node.condition))) {
      return this.evaluate(node.then);
    } else {
      return this.evaluate(node.alt);
    }
  }
  printStmt(node: PrintStmt): Primitive {
    const s = this.evaluate(node.expression);
    const out = stringify(s);
    if (this.mode === "log") {
      this.prints.push(out);
    } else {
      console.log(out);
    }
    return out;
  }
  returnStmt(node: ReturnStmt): Primitive {
    const value = this.evaluate(node.value);
    throw returnValue(value);
  }
  letStmt(node: VariableStmt): Primitive {
    const value = this.evaluate(node.value);
    this.environment.define(node.name.lexeme, value, node.mutable);
    return value;
  }
  maxLoops: number = Infinity;
  loopcap(n: number) {
    this.maxLoops = n;
    return this;
  }
  whileStmt(node: WhileStmt): Primitive {
    let out: Primitive = null;
    let i = 0;
    while (truthy(this.evaluate(node.condition))) {
      out = this.evaluate(node.body);
      i++;
      if (i > this.maxLoops) {
        throw runtimeError(
          `Iterations exceed this environment’s safety ceiling`,
          "interpreting a while-loop",
          node.keyword,
        );
      }
    }
    return out;
  }
  interpret(statements: Statement[]) {
    try {
      let result: Primitive = null;
      const L = statements.length;
      for (let i = 0; i < L; i++) {
        result = this.evaluate(statements[i]);
      }
      return right(result);
    } catch (error) {
      return left(error as Err);
    }
  }
}

type EngineSettings = {
  /**
   * Indicates whether implicit multiplication is permitted.
   * Defaults to true.
   */
  implicitMultiplication: boolean;
};

function lexical(input: string) {
  /**
   * All variables prefixed with a `$` are
   * stateful variables.
   */

  /** The current line. */
  let $line = 1;

  /** The current column. */
  let $column = 1;

  /**
   * Points to the first character
   * of the lexeme currently being
   * scanned.
   */
  let $start = 0;

  /**
   * Points at the character currently
   * being read.
   */
  let $current = 0;

  /**
   * Error indicator defaulting to null.
   * If initialized, scanning will cease (per the condition
   * in {@link atEnd}).
   */
  let $error: null | Err = null;

  /**
   * Returns true if the scanner has reached
   * the end of input.
   */
  const atEnd = () => ($current >= input.length) || ($error !== null);

  /**
   * Consumes and returns the next character
   * in the input expression.
   */
  const tick = () => input[$current++];

  /**
   * Returns the input substring from
   * start to current.
   */
  const slice = () => input.slice($start, $current);

  /**
   * Returns a new token.
   * An optional lexeme may be passed.
   */
  const tkn = (type: tt, lexeme: string | null = null) => {
    lexeme = lexeme ? lexeme : slice();
    return token(type, lexeme, $line, $column);
  };

  /**
   * Returns an error token. If called,
   * sets the mutable error variable.
   */
  const errorTkn = (message: string, phase: string): Token<tt.ERROR, Err> => {
    const errToken = token(tt.ERROR, "", $line, $column);
    $error = lexicalError(message, phase, errToken);
    return token(tt.ERROR, "", $line, $column).lit($error);
  };

  /**
   * Returns the current character.
   */
  const peek = () => atEnd() ? "" : input[$current];

  /**
   * Returns the character just
   * head of the current character.
   */
  const peekNext = () => atEnd() ? "" : input[$current + 1];

  /**
   * Returns the character
   * n places ahead of current.
   */
  const lookup = (n: number) => atEnd() ? "" : input[$current + n];

  /**
   * If the provided expected string
   * matches, increments the current
   * pointer and returns true.
   * Otherwise returns false without
   * increment.
   */
  const match = (expected: string) => {
    if (atEnd()) return false;
    if (input[$current] !== expected) return false;
    $current++;
    return true;
  };

  /**
   * Returns true if the current peek (the character
   * pointed at by `current`) matches the provided
   * number.
   */
  const peekIs = (c: string) => (peek() === c);

  /**
   * Consumes all whitespice while
   * moving the scanner’s `current`
   * pointer forward.
   */
  const skipws = () => {
    while (!atEnd()) {
      const c = peek();
      // deno-fmt-ignore
      switch (c) {
        case ' ':
        case '\r':
        case '\t': 
          tick();
          $column++;
          break;
        case '\n':
          $line++;
          $column=0;
          tick();
          break;
        default:
          return;
      }
    }
  };

  const numToken = (
    numberString: string,
    type: NumberTokenType,
    hasSeparators: boolean,
  ): Token => {
    const n = hasSeparators ? numberString.replaceAll("_", "") : numberString;
    switch (type) {
      case tt.int: {
        const num = Number.parseInt(n);
        if (num > MAX_INT) {
          return errorTkn(
            `Encountered an integer overflow. Consider rewriting “${numberString}” as a bignumber: “#${numberString}”. If “${numberString}” is to be used symbolically, consider rewriting “${numberString}” as a scientific number.`,
            "scanning an integer literal",
          );
        } else {
          return tkn(type).lit(num);
        }
      }
      case tt.float: {
        const num = Number.parseFloat(n);
        if (num > Number.MAX_VALUE) {
          return errorTkn(
            `Encountered a floating point overflow. Consider rewriting "${n}" as a fraction or bigfraction. If "${n}" is to be used symbolically, consider rewriting "${n}" as a scientific number.`,
            "scanning a floating point literal",
          );
        }
        return tkn(tt.float).lit(num);
      }
      case tt.scientific: {
        const [a, b] = n.split("E");
        const base = Number.parseFloat(a);
        const exponent = Number.parseInt(b);
        return tkn(type).lit(tuple(base, exponent));
      }
      case tt.fraction: {
        const [a, b] = n.split("|");
        const N = Number.parseInt(a);
        const D = Number.parseInt(b);
        if (N > MAX_INT || D > MAX_INT) {
          return tkn(tt.bigfraction).lit(tuple(
            BigInt(N),
            BigInt(D),
          ));
        } else {
          return tkn(type).lit(tuple(N, D));
        }
      }
      default: {
        return errorTkn(`Unknown number type`, `scanning a literal number`);
      }
    }
  };

  const number = (initialType: NumberTokenType) => {
    let type = initialType;
    let scannedSeparators = false;
    // scanning integer
    while (isDigit(peek()) && !atEnd()) {
      tick();
    }
    if (peekIs("_") && isDigit(peekNext())) {
      tick(); // eat the '_'
      const phase = `scanning a number with separators`;
      scannedSeparators = true;
      // scan separators
      let digits = 0;
      while (isDigit(peek()) && !atEnd()) {
        tick();
        digits++;
        if (peekIs("_") && isDigit(peekNext())) {
          if (digits === 3) {
            tick();
            digits = 0;
          } else {
            return errorTkn(
              `There must be 3 ASCII digits before the numeric separator “_”.`,
              phase,
            );
          }
        }
      }
      if (digits !== 3) {
        return errorTkn(
          `There must be 3 ASCII digits after the numeric separator “_”.`,
          phase,
        );
      }
    }
    if (peekIs(".") && isDigit(peekNext())) {
      tick();
      type = tt.float;
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
    }

    /**
     * FractionExpr numbers take the form:
     * ~~~ts
     * [int] '|' [int]
     * // e.g., 1|2
     * ~~~
     * Both sides must be integers.
     */
    if (peekIs("|")) {
      if (type !== tt.int) {
        return errorTkn(
          `Expected an integer before “|”`,
          "scanning a fraction",
        );
      }
      type = tt.fraction;
      tick(); // eat the '|'
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
      return numToken(slice(), type, scannedSeparators);
    }

    // scientific
    /**
     * Syntax is: [float] 'E' ('+'|'-') [int]
     * The exponent must always be an integer.
     */
    if (peekIs("E")) {
      if (isDigit(peekNext())) {
        // This is a scientific with the form [float] E [int]
        type = tt.scientific;
        tick(); // eat the 'E'
        while (isDigit(peek())) tick();
      } else if (
        ((peekNext() === "+") || (peekNext() === "-")) && isDigit(lookup(2))
      ) {
        // This is a scientific with the form [float] E (+|-) [int]
        type = tt.scientific;
        tick(); // eat the 'E'
        tick(); // eat the '+' or '-'
        while (isDigit(peek())) tick();
      }
    }
    return numToken(slice(), type, scannedSeparators);
  };

  /**
   * Record of native functions. Each key corresponds
   * to the native function name. The number mapped to
   * by the key is the function’s arity (the number
   * of arguments the function takes).
   */
  const nativeFunctions: Record<NativeFn, number> = {
    deriv: 1,
    avg: 1,
    gcd: 1,
    simplify: 1,
    subex: 1,
    sqrt: 1,
    exp: 1,
    ceil: 1,
    tanh: 1,
    floor: 1,
    sinh: 1,
    cosh: 1,
    sin: 1,
    cos: 1,
    tan: 1,
    lg: 1,
    ln: 1,
    log: 1,
    arctan: 1,
    arccos: 1,
    arccosh: 1,
    arcsin: 1,
    arcsinh: 1,
    "!": 1,
    max: 1,
    min: 1,
  };

  /**
   * Scans a single-quoted variable.
   */
  const algebraicString = () => {
    while ((peek() !== `'`) && !atEnd()) {
      if (peek() === `\n`) {
        $line++;
        $column = 0;
      } else {
        $column++;
      }
      tick();
    }
    if (atEnd()) {
      return errorTkn(
        `Unterminated algebraic string`,
        "scanning an algebraic string",
      );
    }
    tick(); // eat the ':'
    const s = slice().replaceAll(`'`, "");
    return tkn(tt.algebra_string).lit(s);
  };

  const stringLiteral = () => {
    while (peek() !== `"` && !atEnd()) {
      if (peek() === `\n`) {
        $line++;
        $column = 0;
      } else {
        $column++;
      }
      tick();
    }
    if (atEnd()) return errorTkn(`Infinite string`, "scanning a string");
    tick();
    const lex = slice().slice(1, -1);
    return tkn(tt.string, lex);
  };

  /**
   * Scans a word. Word is defined as
   * either a user-defined symbol (the token `SYM`)
   * or a reserved word.
   */
  const word = () => {
    while ((isValidName(peek()) || isDigit(peek())) && (!atEnd())) {
      tick();
    }
    const string = slice();
    const native = nativeFunctions[string as NativeFn];
    if (native !== undefined) {
      return tkn(tt.native);
    }
    // deno-fmt-ignore
    switch (string) {
      case 'this': return tkn(tt.this);
      case 'super': return tkn(tt.super);
      case 'class': return tkn(tt.class);
      case 'false': return tkn(tt.bool).lit(false);
      case 'true': return tkn(tt.bool).lit(true);
      case 'NAN': return tkn(tt.nan).lit(NaN);
      case 'Inf': return tkn(tt.inf).lit(Infinity);
      case 'pi': return tkn(tt.numeric_constant).lit(PI);
      case 'e': return tkn(tt.numeric_constant).lit(E);
      case 'return': return tkn(tt.return);
      case 'while': return tkn(tt.while);
      case 'for': return tkn(tt.for);
      case 'let': return tkn(tt.let);
      case 'var': return tkn(tt.var);
      case 'fn': return tkn(tt.fn);
      case 'if': return tkn(tt.if);
      case 'else': return tkn(tt.else);
      case 'print': return tkn(tt.print);
      case 'rem': return tkn(tt.rem);
      case 'mod': return tkn(tt.mod);
      case 'div': return tkn(tt.div);
      case 'nil': return tkn(tt.nil).lit(null);
      case 'and': return tkn(tt.and);
      case 'or': return tkn(tt.or);
      case 'nor': return tkn(tt.nor);
      case 'xor': return tkn(tt.xor);
      case 'xnor': return tkn(tt.xnor);
      case 'not': return tkn(tt.not);
      case 'nand': return tkn(tt.nand);
    }
    return tkn(tt.symbol);
  };

  const isHexDigit = (char: string) => (
    (("0" <= char) && (char <= "9")) ||
    (("a" <= char) && (char <= "f")) ||
    (("A" <= char) && (char <= "F"))
  );

  const isOctalDigit = (char: string) => (
    "0" <= char && char <= "7"
  );

  const hexNumber = () => {
    if (!(isHexDigit(peek()))) {
      return errorTkn(
        `Expected hexadecimals after “0x”`,
        "scanning a hexadecimal",
      );
    }
    while (isHexDigit(peek()) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0x", "");
    const n = Number.parseInt(s, 16);
    return tkn(tt.int).lit(n);
  };

  const octalNumber = () => {
    if (!(isOctalDigit(peek()))) {
      return errorTkn(
        `Expected octal digits after “0o”`,
        "scanning an octal number",
      );
    }
    while (isOctalDigit(peek()) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0o", "");
    const n = Number.parseInt(s, 8);
    return tkn(tt.int).lit(n);
  };

  const binaryNumber = () => {
    if (!(peekIs("0") || peekIs("1"))) {
      return errorTkn(
        `Expected binary digits after “0b”`,
        "scanning a binary number",
      );
    }
    while ((peekIs("0") || peekIs("1")) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0b", "");
    const n = Number.parseInt(s, 2);
    return tkn(tt.int).lit(n);
  };
  const scanBigNumber = () => {
    let didSeeVBAR = false;
    while (isDigit(peek()) && !atEnd()) {
      tick();
    }
    if (peekIs("|") && isDigit(peekNext())) {
      tick(); // eat the '|'
      didSeeVBAR = true;
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
    }
    const n = slice().replace("#", "");
    if (didSeeVBAR) {
      const [a, b] = n.split("|");
      const N = BigInt(a);
      const D = BigInt(b);
      return tkn(tt.bigfraction).lit([N, D]);
    }
    return tkn(tt.bignumber).lit(BigInt(n));
  };

  /** Scans a token. */
  const scan = (): Token => {
    skipws();
    $start = $current;
    if (atEnd()) {
      return tkn(tt.END, "END");
    }
    const c = tick();
    if (isValidName(c)) {
      return word();
    }
    if (c === "#") {
      if (!isDigit(peek())) {
        return errorTkn(`Expected digits after “#”`, `scanning a bignumber`);
      } else {
        const out = scanBigNumber();
        return out;
      }
    }
    if (isDigit(c)) {
      if (c === "0" && match("b")) {
        return binaryNumber();
      } else if (c === "0" && match("o")) {
        return octalNumber();
      } else if (c === "0" && match("x")) {
        return hexNumber();
      }
      return number(tt.int);
    }
    // deno-fmt-ignore
    switch (c) {
      case ":": return tkn(tt.colon);
      case "&": return tkn(tt.amp);
      case "~": return tkn(tt.tilde);
      case "|": return tkn(tt.vbar);
      case "(": return tkn(tt.lparen);
      case ")": return tkn(tt.rparen);
      case "[": return tkn(tt.lbracket);
      case "]": return tkn(tt.rbracket);
      case "{": return tkn(tt.lbrace);
      case "}": return tkn(tt.rbrace);
      case ",": return tkn(tt.comma);
      case ".": {
        if (match('+')) {
          return tkn(tt.dot_add);
        } else if (match('-')) {
          return tkn(tt.dot_minus);
        } else if (match('*')) {
          return tkn(tt.dot_star);
        } else if (match('^')) {
          return tkn(tt.dot_caret);
        } else {
          return tkn(tt.dot);
        }
      }
      case "-": {
        if (peek()==='-' && peekNext()==='-') {
          while (peek()!=='\n' && !atEnd()) {
            tick();
          }
          return Token.empty;
        } else {
          return tkn(match('-') ? tt.minus_minus : tt.minus);
        }
      }
      case "+": return tkn(match('+') ? tt.plus_plus : tt.plus);
      case "*": return tkn(tt.star);
      case ";": return tkn(tt.semicolon);
      case '%': return tkn(tt.percent);
      case "/": return tkn(tt.slash);
      case "^": return tkn(tt.caret);
      case '!': return tkn(match('=') ? tt.neq : tt.bang);
      case '=': {
        if (peek()==='=' && peekNext()==='=') {
          while (peek()==='=') {
            tick();
          }
          while (!atEnd()) {
            tick();
            if (peek()==='=' && peekNext()==='=' && lookup(2)==='=') {
              break;
            }
          }
          if (atEnd()) {
            return errorTkn(`Unterminated block comment`, `scanning a “=”`);
          }
          while (peek()==='=') {
            tick();
          }
          return Token.empty;
        } else {
          return tkn(match('=') ? tt.deq : tt.eq);
        }
      }
      case '<': return tkn(match('=') ? tt.leq : tt.lt);
      case '>': return tkn(match('=') ? tt.geq : tt.gt);
      case `"`: return stringLiteral();
      case `'`: return algebraicString();
    }
    return errorTkn(`Unknown token: “${c}”`, "scanning");
  };
  const stream = () => {
    const out: Token[] = [];
    let prev = Token.empty;
    let now = scan();
    if (!now.isEmpty()) {
      out.push(now);
    } else if ($error !== null) {
      return left($error);
    }
    let peek = scan();
    if ($error !== null) {
      return left($error);
    }
    while (!atEnd()) {
      prev = now;
      now = peek;
      const k = scan();
      if ($error !== null) {
        return left($error);
      }
      if (k.isEmpty()) {
        continue;
      } else {
        peek = k;
      }
      // remove trailing commas
      if (prev.isRPD() && now.is(tt.comma) && peek.isRPD()) {
        continue;
      }
      out.push(now);
    }
    out.push(peek);
    return right(out);
  };

  const isDone = () => ($current >= input.length);

  return {
    stream,
    scan,
    isDone,
  };
}

class ParserState<STMT extends TREENODE, EXPR extends TREENODE> {
  /**
   * Property bound to the current error status.
   * If this variable is not bound to null, then
   * an error occurred. This variable should only
   * be modified through the panic method or
   * through the error method.
   */
  ERROR: null | Err = null;
  panic(error: Err) {
    this.ERROR = error;
    return this;
  }
  private lexer!: ReturnType<typeof lexical>;
  init(source: string) {
    this.lexer = lexical(source);
    this.next();
    return this;
  }
  prev: Token = Token.empty;
  cursor: number = -1;
  peek: Token = Token.empty;
  current: Token = Token.empty;
  lastExpression: EXPR;
  currentExpression: EXPR;
  lastStmt: nodekind;
  currentStmt: nodekind;
  source: string = "";
  constructor(nil: EXPR, emptyStmt: STMT) {
    this.lastExpression = nil;
    this.currentExpression = nil;
    this.lastStmt = emptyStmt.kind;
    this.currentStmt = emptyStmt.kind;
  }
  implicitSemicolonOK() {
    return (
      this.peek.is(tt.END) ||
      this.atEnd()
    );
  }
  newExpression<E extends EXPR>(expression: E) {
    const prev = this.currentExpression;
    this.currentExpression = expression;
    this.lastExpression = prev;
    return right(expression);
  }
  newStmt<S extends STMT>(statement: S) {
    const prev = this.currentStmt;
    this.currentStmt = statement.kind;
    this.lastStmt = prev;
    const out = right(statement);
    return out;
  }
  semicolonOK() {
    return (
      this.peek.is(tt.END) ||
      this.atEnd()
    );
  }
  next() {
    this.cursor++;
    this.current = this.peek;
    const nxtToken = this.lexer.scan();
    if (nxtToken.isError()) {
      this.ERROR = nxtToken.literal;
      return Token.END;
    }
    this.peek = nxtToken;
    return this.current;
  }
  atEnd() {
    return (this.lexer.isDone()) || (this.ERROR !== null);
  }
  error(message: string, phase: string) {
    const e = syntaxError(message, phase, this.current);
    this.ERROR = e;
    return left(e);
  }
  check(type: tt) {
    if (this.atEnd()) {
      return false;
    } else {
      return this.peek.is(type);
    }
  }
  nextIs(type: tt) {
    if (this.peek.is(type)) {
      this.next();
      return true;
    }
    return false;
  }
}

const enstate = <EXPR extends TREENODE, STMT extends TREENODE>(
  nil: EXPR,
  emptyStmt: STMT,
) => (new ParserState(nil, emptyStmt));

function syntax(source: string) {
  const state = enstate<Expr, Statement>(nil(), exprStmt(nil(), -1))
    .init(
      source,
    );
  const this_expression = (t: Token) => {
    return state.newExpression(thisExpr(t));
  };
  const number: Parslet = (t) => {
    if (t.isNumber()) {
      const out = t.is(tt.int)
        ? state.newExpression(integer(t.literal))
        : state.newExpression(float(t.literal));
      const peek = state.peek;
      if (peek.is(tt.lparen) || peek.is(tt.native) || peek.is(tt.symbol)) {
        const r = expr();
        if (r.isLeft()) {
          return r;
        }
        const right = r.unwrap();
        const star = token(tt.star, "*", peek.L, peek.C);
        const left = out.unwrap();
        return state.newExpression(
          grouped(binex(left, star, right)),
        );
      }
      return out;
    } else {
      return state.error(
        `Expected an integer, but got “${t.lexeme}”`,
        "parsing an integer",
      );
    }
  };

  const string_literal: Parslet = (t) => {
    return state.newExpression(string(t.lexeme));
  };

  const scientific_number: Parslet = (t) => {
    if (t.isScientific()) {
      const [a, b] = t.literal;
      const lhs = float(a);
      const rhs = binex(
        integer(10),
        token(tt.caret, "^", t.L, t.C),
        integer(b),
      );
      return state.newExpression(binex(
        lhs,
        token(tt.star, "*", t.L, t.C),
        rhs,
      ));
    } else {
      return state.error(
        `Unexpected scientific number`,
        "parsing a scientific number",
      );
    }
  };

  /**
   * Parses a {@link RelationalExpr|relational expression}.
   */
  const compare = (op: Token, lhs: Expr): Either<Err, RelationalExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      return state.newExpression(
        relation(lhs, op as Token<RelationalOperator>, rhs),
      );
    });
  };

  /**
   * Parses a right-associative
   * {@link AlgebraicBinaryExpr|algebraic binary expression}.
   */
  const rinfix = (op: Token, lhs: Expr): Either<Err, AlgebraicBinaryExpr> => {
    return expr().chain((rhs) => {
      const out = binex(lhs, op as Token<ArithmeticOperator>, rhs);
      return state.newExpression(out);
    });
  };

  /**
   * Parses an {@link AlgebraicBinaryExpr|algebraic binary expression}.
   */
  const infix = (
    op: Token,
    lhs: Expr,
  ): Either<Err, AlgebraicBinaryExpr | AssignExpr> => {
    if (state.nextIs(tt.eq)) {
      if (isVariable(lhs)) {
        const name = lhs;
        const r = expr();
        if (r.isLeft()) {
          return r;
        }
        const rhs = r.unwrap();
        const value = binex(lhs, op as Token<ArithmeticOperator>, rhs);
        return state.newExpression(assign(name, value));
      } else {
        return state.error(
          `Invalid lefthand side of assignment. Expected a variable to the left of “${op.lexeme}=”, but got “${lhs.toString()}".`,
          `parsing the complex assignment “${op.lexeme}=”`,
        );
      }
    }
    const p = precof(op.type);
    const RHS = expr(p);
    if (RHS.isLeft()) {
      return RHS;
    }
    const rhs = RHS.unwrap();

    const out = binex(lhs, op as Token<ArithmeticOperator>, rhs);
    return state.newExpression(out);
  };

  /**
   * Parses a {@link FractionExpr|rational number}.
   */
  const fraction = (op: Token): Either<Err, FractionExpr> => {
    if (op.isFraction()) {
      const [N, D] = op.literal;
      return state.newExpression(rational(floor(N), floor(abs(D))));
    } else {
      return state.error(
        `Unexpected rational number`,
        "parsing a rational number",
      );
    }
  };

  /**
   * Parses a {@link LogicalBinaryExpr|logical infix expression}.
   */
  const logic_infix = (
    op: Token,
    lhs: Expr,
  ): Either<Err, LogicalBinaryExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      return state.newExpression(
        logicalBinex(lhs, op as Token<BinaryLogicalOperator>, rhs),
      );
    });
  };

  /**
   * Parses a {@link BigNumber|big number}.
   */
  const big_number = (op: Token): Either<Err, BigNumber> => {
    if (op.isBigNumber()) {
      return state.newExpression(bigNumber(op.literal));
    } else {
      return state.error(
        `Unexpected big number literal`,
        `parsing an expression`,
      );
    }
  };

  /**
   * Parses a {@link RationalExpr|big rational}.
   */
  const big_rational = (op: Token): Either<Err, RationalExpr> => {
    if (op.isBigFraction()) {
      const [a, b] = op.literal;
      return state.newExpression(bigRational(a, b));
    } else {
      return state.error(
        `Unexpected big rational literal`,
        `parsing an expression`,
      );
    }
  };

  /**
   * Parses a {@link Bool|boolean literal}.
   */
  const boolean_literal = (op: Token): Either<Err, Bool> => {
    if (op.isBoolean()) {
      return state.newExpression(bool(op.literal));
    } else {
      return state.error(`Unexpected boolean literal`, `parsing an expression`);
    }
  };

  /**
   * Parses a {@link NumericConstant|numeric constant} or {@link Nil|nil}.
   */
  const constant = (op: Token): Either<Err, NumericConstant | Nil> => {
    const type = op.type;
    const erm = `Unexpected constant “${op.lexeme}”`;
    const src = `parsing an expression`;
    // deno-fmt-ignore
    switch (type) {
      case tt.nan: return state.newExpression(numericConstant(NaN, 'NAN'));
      case tt.inf: return state.newExpression(numericConstant(Infinity, 'Inf'));
      case tt.nil: return state.newExpression(nil());
      case tt.numeric_constant: {
        switch (op.lexeme) {
          case "pi": return state.newExpression(numericConstant(PI, "pi"));
          case 'e': return state.newExpression(numericConstant(E, 'e'))
          default: return state.error(erm, src);
        }
      }
      default: return state.error(erm, src);
    }
  };

  /**
   * Parses a {@link GroupExpr|parenthesized expression}.
   */
  const primary = (op: Token) => {
    const innerExpression = expr();
    if (innerExpression.isLeft()) {
      return innerExpression;
    }
    if (state.nextIs(tt.comma)) {
      const elements: Expr[] = [innerExpression.unwrap()];
      do {
        const e = expr();
        if (e.isLeft()) {
          return e;
        }
        elements.push(e.unwrap());
      } while (state.nextIs(tt.comma));
      if (!state.nextIs(tt.rparen)) {
        return state.error(
          `Expected “)” to close the tuple`,
          `parsing a tuple`,
        );
      }
      return state.newExpression(tupleExpr(elements));
    }
    if (!state.nextIs(tt.rparen)) {
      return state.error(
        `Expected closing “)”`,
        "parsing a parenthesized expression",
      );
    }
    return innerExpression.map((e) => grouped(e));
  };

  const allowImplicit = (kind: nodekind) => (
    kind === nodekind.algebraic_infix ||
    kind === nodekind.algebraic_unary ||
    kind === nodekind.float ||
    kind === nodekind.numeric_constant ||
    kind === nodekind.native_call ||
    kind === nodekind.integer ||
    kind === nodekind.grouped_expression
  );

  const function_call = (
    op: Token,
    node: Expr,
  ) => {
    const callee = node;
    if (isGroupExpr(callee) && allowImplicit(callee.expression.kind)) {
      const left = callee.expression;
      const r = expr();
      if (r.isLeft()) return r;
      if (!state.nextIs(tt.rparen)) {
        return state.error(
          `Expected a “)” to close the expression`,
          "parsing an implicit multiplication",
        );
      }
      const right = r.unwrap();
      const star = token(tt.star, "*", op.L, op.C);
      return state.newExpression(binex(left, star, right));
    }
    let args: Expr[] = [];
    if (!state.check(tt.rparen)) {
      const arglist = comma_separated_list(
        isExpr,
        `Expected expression`,
        "call",
      );
      if (arglist.isLeft()) return arglist;
      args = arglist.unwrap();
    }
    const paren = state.next();
    if (!paren.is(tt.rparen)) {
      return state.error(`Expected “)” to close args`, "call");
    }
    const out = call(callee, args, op);
    return state.newExpression(out);
  };

  /**
   * Parses a {@link NativeCall|native function call}.
   */
  const native_call: Parslet = (op): Either<Err, NativeCall> => {
    const lex = op.lexeme;
    const src = `parsing a native call “${lex}”`;
    if (!state.nextIs(tt.lparen)) {
      return state.error(`Expected “(” to open the argument list`, src);
    }
    let args: Expr[] = [];
    if (!state.check(tt.rparen)) {
      const arglist = comma_separated_list(
        isExpr,
        `Expected expression`,
        src,
      );
      if (arglist.isLeft()) {
        return arglist;
      }
      args = arglist.unwrap();
    }
    if (!state.nextIs(tt.rparen)) {
      return state.error(`Expected “)” to close the argument list`, src);
    }
    return state.newExpression(
      nativeCall(op as Token<tt.native, string, NativeFn>, args),
    );
  };

  /**
   * Parses a variable name.
   */
  const variable_name: Parslet = (op) => {
    if (op.isVariable()) {
      const out = variable(op);
      return state.newExpression(out);
    } else {
      return state.error(
        `Unexpected variable “${op.lex}”`,
        "parsing expression",
      );
    }
  };

  /**
   * Parses a logical not expression.
   */
  const logical_not: Parslet = (op) => {
    const p = precof(op.type);
    return expr(p).chain((arg) =>
      state.newExpression(logicalUnary(op as Token<tt.not>, arg))
    );
  };

  /**
   * Parses an {@link AssignExpr|assignment expression}.
   */
  const assignment = (
    op: Token,
    node: Expr,
  ): Either<Err, AssignExpr | SetExpr> => {
    const src = `parsing an assignment`;
    if (isVariable(node)) {
      return expr().chain((n) => {
        return state.newExpression(assign(node, n));
      });
    } else if (isGetExpr(node)) {
      const rhs = expr();
      if (rhs.isLeft()) {
        return rhs;
      }
      return state.newExpression(
        setExpr(node.object, node.name, rhs.unwrap(), op.loc()),
      );
    } else {
      return state.error(
        `Expected a valid assignment target, but got “${node.toString()}”`,
        src,
      );
    }
  };

  const comma_separated_list = <K extends Expr>(
    filter: (e: Expr) => e is K,
    errorMessage: string,
    src: string,
  ) => {
    const elements: K[] = [];
    do {
      const e = expr();
      if (e.isLeft()) return e;
      const element = e.unwrap();
      if (!filter(element)) {
        return state.error(errorMessage, src);
      }
      elements.push(element);
    } while (state.nextIs(tt.comma));
    return right(elements);
  };

  const vector_expression = (prev: Token) => {
    const elements: Expr[] = [];
    const vectors: VectorExpr[] = [];
    const src = `parsing a vector expression`;
    let rows = 0;
    let columns = 0;
    if (!state.check(tt.rbracket)) {
      do {
        const elem = expr();
        if (elem.isLeft()) {
          return elem;
        }
        const element = elem.unwrap();
        if (isVectorExpr(element)) {
          rows++;
          columns = element.elements.length;
          vectors.push(element);
        } else {
          elements.push(element);
        }
      } while (state.nextIs(tt.comma) && !state.atEnd());
    }
    if (!state.nextIs(tt.rbracket)) {
      return state.error(
        `Expected a right bracket “]” to close the vector`,
        src,
      );
    }
    if (vectors.length !== 0) {
      if (vectors.length !== columns) {
        return state.error(
          `Encountered a jagged matrix. Jagged matrices are not permitted. For jagged lists, consider using nested tuples.`,
          src,
        );
      }
      return state.newExpression(matrixExpr(vectors, rows, columns));
    }
    return state.newExpression(vectorExpr(elements, prev));
  };

  const get_expression = (op: Token, lhs: Expr) => {
    const src = `parsing a get expression`;
    const nxt = state.next();
    if (!nxt.isVariable()) {
      return state.error(`Expected property name`, src);
    }
    let exp = getExpr(lhs, nxt, op.loc());
    if (state.nextIs(tt.lparen)) {
      const args: Expr[] = [];
      if (!state.check(tt.rparen)) {
        do {
          const x = expr();
          if (x.isLeft()) {
            return x;
          }
          const arg = x.unwrap();
          args.push(arg);
        } while (state.nextIs(tt.comma));
      }
      const rparen = state.next();
      if (!rparen.is(tt.rparen)) {
        return state.error(`Expected “)” to after method arguments`, src);
      }
      return state.newExpression(call(exp, args, op));
    }
    return state.newExpression(exp);
  };

  const indexing_expression: Parslet = (op, lhs) => {
    const index = expr();
    if (index.isLeft()) {
      return index;
    }
    const rbracket = state.next();
    if (!rbracket.is(tt.rbracket)) {
      return state.error(
        `Expected a right bracket “]” to close the accessor`,
        `parsing an index accessor`,
      );
    }
    return state.newExpression(indexingExpr(lhs, index.unwrap(), rbracket));
  };

  const factorial_expression = (op: Token, node: Expr) => {
    return state.newExpression(
      algebraicUnary(op as Token<AlgebraicUnaryOperator>, node),
    );
  };

  const implicitMUL: Parslet = (op, left) => {
    if (op.is(tt.symbol)) {
      const right = variable(op);
      const star = token(tt.star, "*", op.L, op.C);
      return state.newExpression(binex(
        left,
        star,
        right,
      ));
    } else {
      return state.error(
        `Expected a symbol for implicit multiplication, but got “${op.lexeme}”`,
        "parsing implicit multiplication",
      );
    }
  };

  const decrement = (op: Token, node: Expr) => {
    if (isVariable(node)) {
      const right = binex(
        node,
        op.entype(tt.minus).lex("-"),
        integer(1),
      );
      return state.newExpression(assign(node, right));
    } else {
      return state.error(
        `Expected the lefthand side of “--” to be either a variable or a property accessor, but got “${node.toString()}”`,
        `parsing a decrement “--”`,
      );
    }
  };

  const increment = (op: Token, node: Expr) => {
    if (isVariable(node)) {
      const right = binex(
        node,
        op.entype(tt.plus).lex("+"),
        integer(1),
      );
      return state.newExpression(assign(node, right));
    } else {
      return state.error(
        `Expected the lefthand side of “++” to be either a variable or a property accessor, but got “${node.toString()}”`,
        `parsing an increment “++”`,
      );
    }
  };

  /**
   * The “blank” parslet. This parslet is used as a placeholder.
   * If the {@link expr|expression parser} calls this parslet,
   * then the {@link error} variable is set and parsing shall cease.
   */
  const ___: Parslet = (t) => {
    if (state.ERROR !== null) {
      return left(state.ERROR);
    } else {
      return state.error(`Unexpected lexeme: ${t.lexeme}`, `expression`);
    }
  };

  const vector_infix: Parslet = (op, left) => {
    const p = precof(op.type);
    return expr(p).chain((right) => {
      return state.newExpression(
        vectorBinaryExpr(left, op as Token<VectorBinaryOP>, right),
      );
    });
  };

  const string_infix: Parslet = (op, left) => {
    const p = precof(op.type);
    return expr(p).chain((right) => {
      return state.newExpression(
        stringBinex(left, op as Token<StringBinop>, right),
      );
    });
  };

  const algebraic_string: Parslet = (op) => {
    if (op.isAlgebraString()) {
      const tkns = op.literal;
      const t = token(tt.algebra_string, "", op.L, op.C);
      const result = syntax(tkns).expression();
      if (result.isLeft()) {
        return result;
      }
      const expression = result.unwrap();
      return state.newExpression(algebraicString(expression, t));
    } else {
      return state.error(
        `Unexpected algebraic string`,
        `parsing an expression`,
      );
    }
  };

  const prefix: Parslet = (op) => {
    const p = precof(op.type);
    return expr(p).chain((arg) => {
      if (op.is(tt.minus)) {
        return state.newExpression(algebraicUnary(op, arg));
      } else if (op.is(tt.plus)) {
        return state.newExpression(algebraicUnary(op, arg));
      } else {
        return state.error(
          `Unknown prefix operator “${op.lexeme}”`,
          `parsing a prefix operation`,
        );
      }
    });
  };

  /**
   * The “blank” binding power. This particular binding power
   * is bound either (1) the {@link ___|blank parslet}
   * or (2) parlsets that should not trigger recursive calls.
   */
  const ___o = bp.nil;

  /**
   * The rules table comprises mappings from every
   * {@link tt|token type} to a triple `(Prefix, Infix, B)`,
   * where `Prefix` and `Infix` are {@link Parslet|parslets} (small
   * parsers that handle a single grammar rule), and `B` is a
   * {@link bp|binding power}.
   */
  const rules: BPTable = {
    [tt.END]: [___, ___, ___o],
    [tt.ERROR]: [___, ___, ___o],
    [tt.EMPTY]: [___, ___, ___o],
    [tt.lparen]: [primary, function_call, bp.call],
    [tt.rparen]: [___, ___, ___o],
    [tt.lbrace]: [___, ___, ___o],
    [tt.rbrace]: [___, ___, ___o],
    [tt.lbracket]: [vector_expression, indexing_expression, bp.call],
    [tt.rbracket]: [___, ___, ___o],
    [tt.semicolon]: [___, ___, ___o],
    [tt.colon]: [___, ___, ___o],
    [tt.dot]: [___, get_expression, bp.call],
    [tt.comma]: [___, ___, ___o],
    [tt.super]: [___, ___, ___o],

    [tt.amp]: [___, string_infix, bp.stringop],
    [tt.tilde]: [___, ___, ___o],
    [tt.vbar]: [___, ___, ___o],
    [tt.eq]: [___, assignment, bp.assign],
    [tt.bang]: [___, factorial_expression, bp.postfix],
    [tt.plus_plus]: [___, increment, bp.postfix],
    [tt.minus_minus]: [___, decrement, bp.postfix],
    // vector expressions
    [tt.dot_add]: [___, vector_infix, bp.sum],
    [tt.dot_minus]: [___, vector_infix, bp.sum],
    [tt.dot_star]: [___, vector_infix, bp.product],
    [tt.dot_caret]: [___, vector_infix, bp.power],

    // algebraic expressions
    [tt.plus]: [prefix, infix, bp.sum],
    [tt.minus]: [prefix, infix, bp.difference],
    [tt.star]: [___, infix, bp.product],
    [tt.slash]: [___, infix, bp.quotient],
    [tt.caret]: [___, rinfix, bp.power],
    [tt.percent]: [___, infix, bp.quotient],
    [tt.rem]: [___, infix, bp.quotient],
    [tt.mod]: [___, infix, bp.quotient],
    [tt.div]: [___, infix, bp.quotient],

    // comparison expressions
    [tt.lt]: [___, compare, bp.rel],
    [tt.gt]: [___, compare, bp.rel],
    [tt.neq]: [___, compare, bp.rel],
    [tt.leq]: [___, compare, bp.rel],
    [tt.geq]: [___, compare, bp.rel],
    [tt.deq]: [___, compare, bp.rel],

    // logical binary expressions
    [tt.nand]: [___, logic_infix, bp.nand],
    [tt.xor]: [___, logic_infix, bp.xor],
    [tt.xnor]: [___, logic_infix, bp.xnor],
    [tt.nor]: [___, logic_infix, bp.nor],
    [tt.and]: [___, logic_infix, bp.and],
    [tt.or]: [___, logic_infix, bp.or],
    [tt.not]: [logical_not, ___, bp.not],

    // literals
    [tt.symbol]: [variable_name, implicitMUL, bp.atom],
    [tt.string]: [string_literal, ___, bp.atom],
    [tt.bool]: [boolean_literal, ___, bp.atom],
    [tt.int]: [number, ___, bp.atom],
    [tt.float]: [number, ___, bp.atom],
    [tt.bignumber]: [big_number, ___, bp.atom],
    [tt.bigfraction]: [big_rational, ___, bp.atom],
    [tt.scientific]: [scientific_number, ___, bp.atom],
    [tt.fraction]: [fraction, ___, bp.atom],
    [tt.nan]: [constant, ___, bp.atom],
    [tt.inf]: [constant, ___, bp.atom],
    [tt.nil]: [constant, ___, bp.atom],
    [tt.numeric_constant]: [constant, ___, bp.atom],
    [tt.this]: [this_expression, ___, bp.atom],
    [tt.algebra_string]: [algebraic_string, ___, bp.atom],

    // native calls
    [tt.native]: [native_call, ___, bp.call],

    [tt.if]: [___, ___, ___o],
    [tt.else]: [___, ___, ___o],
    [tt.fn]: [___, ___, ___o],
    [tt.let]: [___, ___, ___o],
    [tt.var]: [___, ___, ___o],
    [tt.return]: [___, ___, ___o],
    [tt.while]: [___, ___, ___o],
    [tt.for]: [___, ___, ___o],
    [tt.class]: [___, ___, ___o],
    [tt.print]: [___, ___, ___o],
  };
  /**
   * Returns the prefix parsing rule mapped to by the given
   * token type.
   */
  const prefixRule = (t: tt): Parslet => rules[t][0];

  /**
   * Returns the infix parsing rule mapped to by the given
   * token type.
   */
  const infixRule = (t: tt): Parslet => rules[t][1];

  /**
   * Returns the {@link bp|precedence} of the given token type.
   */
  const precof = (t: tt): bp => rules[t][2];

  /**
   * Parses an {@link Expr|conventional expression} via
   * Pratt parsing.
   */
  const expr = (minbp: number = bp.lowest): Either<Err, Expr> => {
    let token = state.next();
    const pre = prefixRule(token.type);
    let lhs = pre(token, nil());
    if (lhs.isLeft()) {
      return lhs;
    }
    while (minbp < precof(state.peek.type)) {
      if (state.atEnd()) {
        break;
      }
      token = state.next();
      const r = infixRule(token.type);
      const rhs = r(token, lhs.unwrap());
      if (rhs.isLeft()) {
        return rhs;
      }
      lhs = rhs;
    }
    return lhs;
  };

  const PRINT = () => {
    const current = state.current;
    // print eaten in STMT
    const arg = EXPRESSION();
    return arg.map((x) => printStmt(current, x.expression));
  };

  /**
   * Parses an {@link IfStmt|if-statement}.
   */
  const IF = (): Either<Err, IfStmt> => {
    const keyword = state.current;
    const c = expr();
    const src = `parsing an if-statement`;
    if (c.isLeft()) {
      return c;
    }
    const condition = c.unwrap();
    if (!state.nextIs(tt.lbrace)) {
      return state.error(
        `Expected a left brace “{” to begin the consequent block.`,
        src,
      );
    }
    const consequent = BLOCK();
    if (consequent.isLeft()) {
      return consequent;
    }
    const thenBranch = consequent.unwrap();
    let elseBranch: Statement = returnStmt(
      nil(),
      state.current,
    );
    if (state.nextIs(tt.else)) {
      const _else = STMT();
      if (_else.isLeft()) {
        return _else;
      }
      elseBranch = _else.unwrap();
    }
    return state.newStmt(ifStmt(keyword, condition, thenBranch, elseBranch));
  };

  /**
   * Parses a {@link FnStmt|function statement} (i.e., a function declaration).
   */
  const FN = (): Either<Err, FnStmt> => {
    // fn eaten in STMT
    const name = state.next();
    const src = `parsing a function a declaration`;
    if (!name.isVariable()) {
      return state.error(
        `Expected a valid identifier for the function’s name, but got “${name.lexeme}”.`,
        src,
      );
    }
    if (!state.nextIs(tt.lparen)) {
      return state.error(
        `Expected a left parenthesis “(” to begin the parameter list`,
        src,
      );
    }
    const params: Token<tt.symbol>[] = [];
    if (!state.peek.is(tt.rparen)) {
      do {
        const expression = state.next();
        if (!expression.isVariable()) {
          return state.error(
            `Expected a valid identifier as a parameter, but got “${expression.lexeme}”`,
            src,
          );
        }
        params.push(expression);
      } while (state.nextIs(tt.comma));
    }
    if (!state.nextIs(tt.rparen)) {
      return state.error(
        `Expected a right parenthesis “)” to close the parameter list`,
        src,
      );
    }
    if (state.nextIs(tt.eq)) {
      const body = EXPRESSION();
      return body.chain((b) => state.newStmt(functionStmt(name, params, [b])));
    }
    if (!state.nextIs(tt.lbrace)) {
      return state.error(
        `Expected a left-brace “{” to open the function’s body. If this function’s body is composed of a single statement, consider using the assignment operator “=”`,
        src,
      );
    }
    const body = BLOCK();
    return body.chain((b) =>
      state.newStmt(functionStmt(name, params, b.statements))
    );
  };

  const WHILE = () => {
    const current = state.current;
    const src = `parsing a while loop`;
    const loopCondition = expr();
    if (loopCondition.isLeft()) {
      return loopCondition;
    }
    if (!state.nextIs(tt.lbrace)) {
      return state.error(`Expected a block after the condition`, src);
    }
    const body = BLOCK();
    if (body.isLeft()) {
      return body;
    }
    return body.chain((loopBody) =>
      state.newStmt(whileStmt(current, loopCondition.unwrap(), loopBody))
    );
  };

  /**
   * Parses a {@link BlockStmt|block statement}.
   */
  const BLOCK = (): Either<Err, BlockStmt> => {
    const statements: Statement[] = [];
    while (!state.atEnd() && !state.check(tt.rbrace)) {
      const stmt = STMT();
      if (stmt.isLeft()) {
        return stmt;
      }
      statements.push(stmt.unwrap());
    }
    if (!state.nextIs(tt.rbrace)) {
      return state.error(
        `Expected a right brace “}” to close the block`,
        `parsing a block`,
      );
    }
    return state.newStmt(block(statements));
  };

  /**
   * Parses a {@link VariableStmt|let statement}.
   */
  const VAR = (prev: tt.let | tt.var): Either<Err, VariableStmt> => {
    const src = `parsing a variable declaration`;
    const name = state.next();
    if (!name.isVariable()) {
      return state.error(`Expected a valid identifier`, src);
    }
    if (!state.nextIs(tt.eq)) {
      return state.error(`Expected an assignment operator “=”`, src);
    }
    const init = EXPRESSION();
    if (init.isLeft()) {
      return init;
    }
    const value = init.unwrap();
    return state.newStmt(
      (prev === tt.let ? letStmt : varStmt)(name, value.expression),
    );
  };

  /**
   * Parses an expression statement.
   */
  const EXPRESSION = (): Either<Err, ExprStmt> => {
    const out = expr();
    if (out.isLeft()) {
      return out;
    }
    const expression = out.unwrap();
    const line = state.peek.L;
    if (state.nextIs(tt.semicolon) || state.implicitSemicolonOK()) {
      return state.newStmt(exprStmt(expression, line));
    }
    return state.error(
      `Expected “;” to end the statement`,
      "expression-statement",
    );
  };

  const RETURN = (): Either<Err, ReturnStmt> => {
    const c = state.current;
    const out = EXPRESSION();
    return out.chain((e) => state.newStmt(returnStmt(e.expression, c)));
  };

  const FOR = (): Either<Err, Statement> => {
    // keyword 'for' eaten by STMT
    const current = state.current;
    const src = `parsing a for-loop`;
    const preclauseToken = state.next();
    if (!preclauseToken.is(tt.lparen)) {
      return state.error(
        `Expected a left parentheses “(” after the keyword “for” to begin the loop’s clauses, but got “${preclauseToken.lexeme}”.`,
        src,
      );
    }
    let init: Statement | null = null;
    if (state.nextIs(tt.semicolon)) {
      init = init;
    } else if (state.nextIs(tt.var)) {
      const initializer = VAR(tt.var);
      if (initializer.isLeft()) {
        return initializer;
      }
      init = initializer.unwrap();
    } else {
      const exp = EXPRESSION();
      if (exp.isLeft()) {
        return exp;
      }
      init = exp.unwrap();
    }
    let condition: Expr | null = null;
    if (!state.check(tt.semicolon)) {
      const c = expr();
      if (c.isLeft()) {
        return c;
      }
      condition = c.unwrap();
    }
    const postConditionToken = state.next();
    if (!postConditionToken.is(tt.semicolon)) {
      return state.error(
        `Expected a semicolon “;” after the for-loop condition, but got “${postConditionToken.lexeme}”.`,
        src,
      );
    }
    let increment: Expr | null = null;
    if (!state.check(tt.rparen)) {
      const inc = expr();
      if (inc.isLeft()) {
        return inc;
      }
      increment = inc.unwrap();
    }
    const postIncrementToken = state.next();
    if (!postIncrementToken.is(tt.rparen)) {
      return state.error(
        `Expected a right “)” to close the for-loop’s clauses, but got “${postIncrementToken.lexeme}”`,
        src,
      );
    }
    const b = STMT();
    if (b.isLeft()) {
      return b;
    }
    const bodyLine = state.current.L;
    let body: Statement = b.unwrap();
    if (increment !== null) {
      if (isBlock(body)) {
        body.statements.push(exprStmt(increment, bodyLine));
      } else {
        body = block([body, exprStmt(increment, bodyLine)]);
      }
    }
    let loopCondition: Expr = bool(true);
    if (condition !== null) {
      loopCondition = condition;
    }
    body = whileStmt(current, loopCondition, body);
    if (init !== null) {
      body = block([init, body]);
    }
    return state.newStmt(body);
  };

  const CLASS = () => {
    // class keyword eaten in Stmt
    const src = `parsing a class declaration`;
    const name = state.next();
    if (!name.isVariable()) {
      return state.error(
        `Expected a class name after “class”, but got “${name.lexeme}”`,
        src,
      );
    }
    const lbrace = state.next();
    if (!lbrace.is(tt.lbrace)) {
      return state.error(
        `Expected a left-brace “{” to begin the body of class “${name.lexeme}”, but got “${lbrace.lexeme}”`,
        src,
      );
    }
    const methods = [];
    while (!state.check(tt.rbrace) && !state.atEnd()) {
      const f = FN();
      if (f.isLeft()) {
        return f;
      }
      methods.push(f.unwrap());
    }
    const postMethodsToken = state.next();
    if (!postMethodsToken.is(tt.rbrace)) {
      return state.error(
        `Expected a right brace “}” after the body of class “${name.lexeme}”, but got “${postMethodsToken.lexeme}”.`,
        src,
      );
    }
    return state.newStmt(classStmt(name, methods));
  };

  /**
   * Parses a statement.
   */
  const STMT = (): Either<Err, Statement> => {
    if (state.nextIs(tt.var)) {
      return VAR(tt.var);
    } else if (state.nextIs(tt.let)) {
      return VAR(tt.let);
    } else if (state.nextIs(tt.fn)) {
      return FN();
    } else if (state.nextIs(tt.lbrace)) {
      return BLOCK();
    } else if (state.nextIs(tt.if)) {
      return IF();
    } else if (state.nextIs(tt.return)) {
      return RETURN();
    } else if (state.nextIs(tt.while)) {
      return WHILE();
    } else if (state.nextIs(tt.for)) {
      return FOR();
    } else if (state.nextIs(tt.print)) {
      return PRINT();
    } else if (state.nextIs(tt.class)) {
      return CLASS();
    } else {
      return EXPRESSION();
    }
  };

  return {
    /**
     * Returns a syntax analysis of
     * a single expression.
     */
    expression() {
      // The error is not null if
      // an error occurred during
      // scanning. In that case we
      // immediately return the scanner’s
      // reported error.
      if (state.ERROR !== null) {
        return left(state.ERROR);
      }
      const out = expr();
      return out;
    },
    /**
     * Returns a syntax analysis of the entire
     * program with statements.
     */
    statements() {
      // Similar to analyzeExpression, we
      // immediately return the scanner’s
      // reported error.
      if (state.ERROR !== null) {
        return left(state.ERROR);
      }
      const stmts: Statement[] = [];
      while (!state.atEnd()) {
        const stmt = STMT();
        if (stmt.isLeft()) {
          return stmt;
        }
        stmts.push(stmt.unwrap());
      }
      return right(stmts);
    },
  };
}

export function engine(source: string) {
  let settings: EngineSettings = {
    implicitMultiplication: true,
  };

  /** Parses the source code. */
  const parse = () => syntax(source).statements();

  /** Compiles the source code. */
  const compile = (program: Left<Err> | Right<Statement[]>) => {
    if (program.isLeft()) {
      return program;
    }
    const statements = program.unwrap();
    const interpreter = new Compiler();
    const resolved = resolvable(interpreter).resolved(statements);
    if (resolved.isLeft()) {
      return resolved;
    }
    return interpreter.interpret(statements);
  };

  return {
    tokens: () => lexical(source).stream(),
    ast: () => objectTree(parse()),
    /** Sets the engine’s settings. */
    engineSettings(options: Partial<EngineSettings>) {
      settings = { ...settings, ...options };
      return this;
    },
    algebraTree() {
      throw new Error(`method unimplemented`);
    },
    /**
     * Executes the given source code with the current
     * engine settings.
     */
    execute() {
      const parsing = parse();
      if (parsing.isLeft()) return parsing.unwrap().message;
      const result = compile(parsing);
      if (result.isLeft()) return result.unwrap().message;
      const out = result.unwrap();
      return out;
    },
    log() {
      const program = parse();
      if (program.isLeft()) {
        const msg = program.unwrap().report();
        return [msg];
      }
      const statements = program.unwrap();
      const interpreter = new Compiler().setmode("log").loopcap(600);
      const resolved = resolvable(interpreter).resolved(statements);
      if (resolved.isLeft()) {
        const msg = resolved.unwrap().report();
        return [msg];
      }
      const result = interpreter.interpret(statements);
      if (result.isLeft()) {
        const msg = result.unwrap().report();
        return [msg];
      } else {
        const prints = interpreter.prints;
        prints.push("OK");
        return prints;
      }
    },
  };
}
