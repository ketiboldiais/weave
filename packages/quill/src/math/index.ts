export const {
  atan2,
  cos,
  sin,
  sqrt,
  abs,
  floor,
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
export const randInt = (min: number, max: number) => (
  floor(random() * (max - min + 1)) + min
);

/**
 * Returns a random floating point number between the
 * provided minimum and maximum (not including the maximum).
 */
export const randFloat = (min: number, max: number) => (
  random() * (max - min) + min
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

export const v2 = (nums: N2 | N3 | number): N2 => (
  typeof nums === "number"
    ? [nums, nums]
    : (nums.length === 3 ? [nums[0], nums[1]] : nums)
);
export const v3 = (nums: N2 | N3 | number): N3 => (
  typeof nums === "number"
    ? [nums, nums, nums]
    : (nums.length === 2 ? [...nums, 0] : nums)
);

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

// deno-fmt-ignore
const unop = (op:(a:number) => number) => (
  A: N2|N3|number,
) => v3([
  op(x(A)),
  op(y(A)),
  op(z(A)),
])

// deno-fmt-ignore
const binop = (op:(a:number, b:number) => number) => (
  A: N2|N3|number, B:N2|N3|number
) => v3([
  op(x(A),x(B)),
  op(y(A),y(B)),
  op(z(A),z(B)),
])

/**
 * Returns the component-wise sum.
 */
export const add = binop((a, b) => a + b);

/**
 * Returns the component-wise negation.
 */
export const neg = unop((a) => -a);

/**
 * Returns the component-wise absolute value.
 */
export const absv = unop((a) => abs(a));

/**
 * Returns the component-wise difference.
 */
export const sub = binop((a, b) => a - b);

/**
 * Returns component-wise product.
 */
export const cmul = binop((a, b) => a * b);

/**
 * Returns the scalar product.
 */
export const smul = (A: N2 | N3, scale: number) => cmul(A, scale);

/**
 * Returns the scalar division.
 */
export const sdiv = (A: N2 | N3, n: number) => v3(A).map((x) => (x / n) || 0);

/**
 * Returns the pair-wise division.
 */
export const pdiv = binop((a, b) => (a / b) || 0);

/**
 * Returns the component-wise square.
 */
export const square = unop((a) => a ** 2);

// deno-fmt-ignore
export const reducer = (
  callback: (
    previousValue: number,
    currentValue: number,
    currentIndex: number,
    array: number[],
) => number) => (A: N2 | N3) => A.reduce(callback);

/**
 * Returns the sum of every component of
 * the vector.
 */
export const sum = reducer((p, c) => p + c);

/**
 * Returns the product of every component
 * of the vector.
 */
export const prod = reducer((p, c) => p * c);

export const mag = (v: N2 | N3) => sum(square(v3(v)));

/**
 * Returns the component-wise equality.
 */
export const equal = (A: N2 | N3, B: N2 | N3) => (
  zip(v3(A), v3(B))
    .map(([a, b]) => a === b)
    .reduce((prev, curr) => prev && curr)
);

export const cross = (a: N3, b: N3): N3 => [
  (y(a) * z(b)) - (z(a) * y(b)),
  (z(a) * x(b)) - (x(a) * z(b)),
  (x(a) * y(b)) - (y(a) * x(b)),
];

// deno-fmt-ignore
export const distance = (a: N2 | N3, b: N2 | N3) => sqrt(
  ((x(a) - x(b))**2) + ((y(a) - y(b))**2) + ((z(a) - z(b))**2)
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
