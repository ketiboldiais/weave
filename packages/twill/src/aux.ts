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
