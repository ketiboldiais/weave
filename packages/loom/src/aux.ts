export const uid = (length: number = 4, base = 36) =>
  Math.random()
    .toString(base)
    .replace(/[^a-z]+/g, "")
    .substring(0, length + 1);

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
export const dne = (x: any): x is undefined => (x === undefined);
export const nil = (x: any): x is null => (x === null);
export const unsafe = (x: any) => dne(x) || nil(x);

export const arraySplit = <T>(array: T[]) => {
  const L = array.length;
  const half = Math.ceil(L / 2);
  const left = array.slice(0, half);
  const right = array.slice(half);
  return [left, right] as [T[], T[]];
};

/**
 * Returns a `translate` string for use with the `g`
 * element.
 */
export const shift = (
  x: number = 0,
  y: number = 0,
) => `translate(${x},${y})`;


