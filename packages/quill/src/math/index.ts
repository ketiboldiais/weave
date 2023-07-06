export const {
  abs,
  atan2,
  cos,
  max,
  min,
  sin,
  sqrt,
} = Math;
export const epsilon = Number.MIN_SAFE_INTEGER;
export const pi = Math.PI;
export const halfPi = Math.PI / 2;
export const tau = Math.PI * 2;
export const acos = (x: number) => (
  x > 1 ? 0 : x < -1 ? pi : Math.acos(x)
);
export const asin = (x: number) => (
  x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x)
);

export type N3 = [number, number, number];
export type N2 = [number, number];

export const p2 = (nums: N2 | N3 | number): N2 => (
  typeof nums === "number"
    ? [nums, nums]
    : (nums.length === 3 ? [nums[0], nums[1]] : nums)
);
export const p3 = (nums: N2 | N3 | number): N3 => (
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
  typeof coord === "number" ? coord : p3(coord)[index]
);

export const px = accessor(0);
export const py = accessor(1);
export const pz = accessor(2);

// deno-fmt-ignore
const unop = (op:(a:number) => number) => (
  A: N2|N3|number,
) => p3([
  op(px(A)),
  op(py(A)),
  op(pz(A)),
])

// deno-fmt-ignore
const binop = (op:(a:number, b:number) => number) => (
  A: N2|N3|number, B:N2|N3|number
) => p3([
  op(px(A),px(B)),
  op(py(A),py(B)),
  op(pz(A),pz(B)),
])

/**
 * Returns the component-wise sum.
 */
export const add = binop((a, b) => a + b);

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

export const mag = (v: N2 | N3) => sum(square(p3(v)));

