export function uid(length: number = 4, base = 36) {
  return Math.random()
    .toString(base)
    .replace(/[^a-z]+/g, "")
    .substring(0, length + 1);
}
/**
 * Give two values of type `T`,
 * returns the _safer_ value of the two.
 * A safe value is any value that:
 *
 * 1. is not null,
 * 2. is not undefined,
 * 3. is not the empty string, and
 * 4. is not NaN.
 *
 * If both values are safe, picks the first.
 */
export const safer = <T>(
  value: null | undefined | T,
  fallback: T,
) =>
  value !== undefined &&
    value !== null &&
    value !== "" &&
    !Number.isNaN(value)
    ? (value as unknown as T)
    : (fallback as unknown as T);

/** Returns a tuple of type `T`. */
export const tuple = <T extends any[]>(...data: T) => data;
export const isNumber = (x: any): x is number => typeof x === "number";
export const sq = (x: number) => x * x;

export const dne = (x: any): x is undefined => (x === undefined);
export const nil = (x: any): x is null => (x === null);
export const unsafe = (x: any) => dne(x) || nil(x);
export const safe = (x: any) => !dne(x) && !nil(x);

export const arraySplit = <T>(array: T[]) => {
  const L = array.length;
  const half = Math.ceil(L / 2);
  const left = array.slice(0, half);
  const right = array.slice(half);
  return [left, right] as [T[], T[]];
};
export const isnil = (x: any): x is null => x === null;
export type SafeObj<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
export const randFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};
export const clamp = (
  min: number,
  input: number,
  max: number,
) => Math.min(Math.max(input, min), max);
export type O<K extends string, T> = Record<K, T>;
export const isnum = (x: any): x is number => typeof x === "number";
export const isstr = (x: any): x is string => typeof x === "string";

export const toDeg = (radians: number) => radians * (180 / Math.PI);
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);
export const cc = "currentColor";
export const round = (value: number, to: number = 2) => {
  const cap = 10 ** (Math.abs(Math.floor(to)));
  return Math.round((value + Number.EPSILON) * cap) / cap;
};

/**
 * Returns a `translate` string for use with the `g`
 * element.
 */
export const shift = (
  x: number = 0,
  y: number = 0,
) => `translate(${x},${y})`;

export const toFrac = (x0:number) => {
  let eps = 1.0E-15;
  let h, h1, h2, k, k1, k2, a, x;
  x = x0;
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
  return [h,k];
};
