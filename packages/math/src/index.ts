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
 * Clamps the input number between the minimum and
 * maximum.
 *
 * @param min - The smallest number the input can be.
 * @param input - The number to clamp.
 * @param max - The largest number the input can be.
 */
export const clamp = (
  min: number,
  input: number,
  max: number,
) => Math.min(Math.max(input, min), max);

/**
 * Rounds the given number value to the number of given decimal
 * places.
 *
 * @param value - The number to round.
 * @param decimalPlaces - The number of decimal places.
 */
export const round = (value: number, decimalPlaces: number = 2) => {
  const cap = 10 ** (Math.abs(Math.floor(decimalPlaces)));
  return Math.round((value + Number.EPSILON) * cap) / cap;
};

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

export { v2, v3, Vector, vector } from "./vector.js";
export { diagonal, Matrix, matrix, maxColumnCount } from "./matrix.js";
