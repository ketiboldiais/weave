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

export type O<K extends string, T> = Record<K, T>;
export const isnum = (x: any): x is number => typeof x === "number";
export const isstr = (x: any): x is string => typeof x === "string";

export const cc = "currentColor";

/**
 * Returns a `translate` string for use with the `g`
 * element.
 */
export const shift = (
  x: number = 0,
  y: number = 0,
) => `translate(${x},${y})`;

export const pi = Math.PI;
export const cos = Math.cos;
export const sin = Math.sin;
export const tan = Math.tan;
export const arctan = Math.atan;
export const arctan2 = Math.atan2;
export const maxof = Math.max;
export const minof = Math.min;
export const abs = Math.abs;
export const square = (x: number) => x * x;
