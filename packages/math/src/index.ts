/**
 * Converts the provided number (assumed to be radians) to degrees.
 */
export const toDegrees = (radians: number) => radians * (180 / Math.PI);

/**
 * Converts the provided number (assumed to be degrees) to radians.
 */
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

/**
 * Returns a random integer between the provided minimum
 * and maximum (not including the maximum).
 */
export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random floating point number between the
 * provided minimum and maximum (not including the maximum).
 */
export const randFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

/**
 * Returns the `n mod d`.
 */
export const mod = (n: number, d: number) => ((n % d) + d) % d;

/**
 * Converts the provided number into a pair of integers (N,D),
 * where `N` is the numerator and `D` is the
 * denominator.
 */
export function toFrac(numberValue: number) {
  let eps = 1.0E-15;
  let h, h1, h2, k, k1, k2, a, x;
  x = numberValue;
  a = Math.floor(x);
  h1 = 1;
  k1 = 0;
  h = a;
  k = 1;
  while (x - a > eps * k * k) {
    x = 1 / (x - a);
    a = Math.floor(x);
    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;
    h = h2 + a * h1;
    k = k2 + a * k1;
  }
  return [h, k];
}

/**
 * Given a numerator `N` and a denominator `D`,
 * returns a simplified fraction.
 */
export function simplify([N, D]: [number, number]) {
  const sgn = Math.sign(N) * Math.sign(D);
  const n = Math.abs(N);
  const d = Math.abs(D);
  const f = gcd(n, d);
  return [(sgn * n) / f, (sgn * d) / f];
}

/**
 * Returns the greatest common denominator
 * of the provided integers `a` and `b`.
 */
export function gcd(a: number, b: number) {
  a = Math.floor(a);
  b = Math.floor(b);
  let t = a;
  while (b !== 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export const floor = Math.floor;
export const cos = Math.cos;
export const sin = Math.sin;
export const tan = Math.tan;

export {
  add2D,
  binop2D,
  distance2D,
  div2D,
  mag2D,
  mul2D,
  normal2D,
  normalized2D,
  sub2D,
  v2,
  v3,
  Vector,
  vector,
} from "./vector.js";
export { diagonal, Matrix, matrix, maxColumnCount } from "./matrix.js";

export const {
  atan2,
  sqrt,
  abs,
  ceil,
  random,
} = Math;
export const min = (nums: number[]) => (Math.min(...nums));
export const max = (nums: number[]) => (Math.max(...nums));
export const epsilon = Number.EPSILON;
export const pi = Math.PI;
export const halfPi = Math.PI / 2;
export const tau = Math.PI * 2;
export const acos = (x: number) => (
  x > 1 ? 0 : x < -1 ? pi : Math.acos(x)
);
export const asin = (x: number) => (
  x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x)
);

/**
 * Given the min-max interval, returns a function that
 * clamps the two numbers.
 */
// deno-fmt-ignore
export const clamper = (
  interval: [number, number]
) => (input: number) => (
  min([max([input, interval[0]]), interval[1]])
);

/**
 * Rounds the given number value to the number of given decimal
 * places.
 *
 * @param value - The number to round.
 * @param places - The number of decimal places.
 */
export const round = (num: number, places: number = 2) => (
  Math.round(
    (num * (10 ** places)) * (1 + epsilon),
  ) / (10 ** places)
);
export type N3 = [number, number, number];
export type N2 = [number, number];

// deno-fmt-ignore
const accessor = (
  index: number
) => (
  coord: N2 | N3 | number
) => (
  typeof coord === "number" ? coord : (coord[index]??0)
);

export const x = accessor(0);
export const y = accessor(1);
export const z = accessor(2);

export const zip = <A extends any[], B extends any[]>(
  array1: A,
  array2: B,
): ([A[number], B[number]])[] => (
  array1.map((k, i) => [k, array2[i]])
);

/**
 * Clamps the input number between the minimum and maximum.
 *
 * @param minimum - The smallest value the input can be.
 * @param input - The input number.
 * @param maximum - The largest value the input can be.
 */
export const clamp = (minimum: number, input: number, maximum: number) => (
  isNaN(input) ? minimum : (
    input === Infinity
      ? maximum
      : (input === -Infinity ? minimum : min([maximum, max([minimum, input])]))
  )
);

/**
 * Given the number pair `(x1,x2)` returns the value between `x1`
 * and `x2` at `p` percent of the dsitance between `x1` and `x2`.
 * Useful for computations like: “What x-coordinate is 35%
 * between 46 and 182?” Note that the percentage `p`
 * is assumed to be between `0` and `1`.
 */
export const lerp = ([x1, x2]: N2, p: number) => (
  x1 * (1 - p) + x2 * p
);

/**
 * Given the number pair `(x,y)`, returns the value at the given decimal
 * point `a`. Used primarily for computations like:
 * How far through this line has this point moved?
 */
export const ilerp = ([x, y]: N2, a: number) => clamp(0, (a - x) / (y - x), 1);

export const interpolator = (domain: N2, range: N2) => (n: number) => (
  lerp([x(range), y(range)], ilerp([x(domain), y(domain)], n))
);

/**
 * Interpolates the given number `n` based on the specified
 * domain and range.
 */
export const iterpolate = (n: number, domain: N2, range: N2) => (
  interpolator(domain, range)(n)
);

/**
 * Creates a new array with the given length and
 * value.
 */
const arr = (length: number, value: number) => (
  new Array(length).fill(value)
);

/**
 * Returns a 3D-matrix of order
 * 3×3.
 */
export const mtx = (rows: number[][]) => rows;

/**
 * Returns the transpose of the given matrix A.
 */
export const transpose = (A: (number[])[]) => (
  A[0].map((_, c) => A.map((r) => r[c]))
);

/**
 * Returns the matrix multiplication of A and B.
 * This function does not perform any checks on whether
 * the number of rows in A equals the number of rows in
 * B (a necessary condition for matrix multiplication).
 * Functions using the matrix dot product must handle
 * that themselves.
 */
export const mdot = (A: (number[])[], B: (number[])[]) => (
  arr(A.length, 0)
    .map(() => new Array(B[0].length).fill(0))
    .map((row, i) =>
      row.map((_, j) => A[i].reduce((sum, elm, k) => sum + (elm * B[k][j]), 0))
    )
);

export const mulx = (A: (number[])[], s: number) => (
  A.map((r) => r.map((c) => c * s))
);

/**
 * Returns the slope of a given line.
 * @param p1 - The startpoint, a pair of numbers `(a,b)`.
 * @param p2 - The endpoint, a pair of numbers `(a,b)`.
 * @param precision - The number of decimal places to round to.
 */
export const slope = (
  p1: number[],
  p2: number[],
  precision: number = 5,
) => {
  const [x1, y1] = p1.length === 2 ? p1 : [1, 1];
  const [x2, y2] = p2.length === 2 ? p2 : [1, 1];
  const dydx = (y2 - y1) / (x2 - x1);
  return round(dydx, precision);
};
