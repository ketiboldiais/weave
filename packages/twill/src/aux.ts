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
  fallback: T
) =>
  value !== undefined &&
  value !== null &&
  value !== "" &&
  !Number.isNaN(value)
    ? (value as unknown as T)
    : (fallback as unknown as T);

/** Returns a tuple of type `T`. */
export const tuple = <T extends any[]>(...data: T) => data;
export const isNumber = (x: any): x is number =>
  typeof x === "number";
export const sq = (x: number) => x * x;
export const unsafe = (x: any) =>
  x === undefined || x === null;
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

type BoxType = "some" | "none";
export abstract class Box<T> {
  tag: BoxType;
  constructor(tag: BoxType) {
    this.tag = tag;
  }
  abstract isNone(): boolean;
  abstract isSome(): boolean;
  abstract map<K>(f: (data: T) => K): Box<K>;
  abstract chain<K>(f: (data: T) => Box<K>): Box<K>;
  abstract peek(f: (data: T | null) => void): Box<T>;
  abstract ap<K>(box: Box<(data: T) => K>): Box<K>;
}

export class Some<T> extends Box<T> {
  data: T;
  constructor(data: T) {
    super("some");
    this.data = data;
  }
  isNone(): this is None<never> {
    return false;
  }
  isSome(): this is Some<T> {
    return true;
  }
  map<K>(f: (data: T) => K): Box<K> {
    return new Some(f(this.data));
  }
  chain<K>(f: (data: T) => Box<K>): Box<K> {
    return f(this.data);
  }
  peek(f: (data: T | null) => void) {
    f(this.data);
    return this;
  }
  ap<K>(box: Box<(data: T) => K>): Box<K> {
    return box.map((f) => f(this.data));
  }
}

export class None<T> extends Box<T> {
  data: null = null;
  constructor() {
    super("none");
  }
  isNone(): this is Some<never> {
    return true;
  }
  isSome(): this is None<T> {
    return false;
  }
  ap<K>(box: Box<(data: T) => K>): Box<K> {
    return this as any as Box<K>;
  }
  chain<K>(f: (data: T) => Box<K>): Box<K> {
    return this as any as Box<K>;
  }
  map<K>(f: (data: T) => K): Box<K> {
    return this as any as Box<K>;
  }
  peek(f: (data: T | null) => void) {
    f(null);
    return this;
  }
}

export const box = <T>(value?: T | null): Box<T> =>
  value === null || value === undefined
    ? new None<T>()
    : new Some<T>(value);

export const randInt = (min:number, max:number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export const randFloat = (min:number, max:number) => {
  return Math.random() * (max - min) + min;
}
export const clamp = (min:number,input:number,max:number) => (
  Math.min(Math.max(input,min),max)
)