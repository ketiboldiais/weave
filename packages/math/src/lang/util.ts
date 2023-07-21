/**
 * @file
 * This file contains various utility and helper
 * functions used by the engine.
 */

// ========================================================
// Math Object Exports
// ========================================================

export const { floor, ceil, abs, cos, sin, sign, pow, expm1 } = Math;

/**
 * Prints to the console.
 */
export const print = console.log;

/**
 * Utility function for zipping lists.
 */
export const zip = <A extends any[], B extends any[]>(
  array1: A,
  array2: B,
): ([A[number], B[number]])[] =>
  (
    array1.reduce((acc, curr, ind): ([A[number], B[number]])[] => {
      acc.push([curr, array2[ind]]);
      return acc;
    }, [])
  ).filter(([a, b]: [A[number], B[number]]) =>
    a !== undefined && b !== undefined
  );

/**
 * Returns true if the given character is an ASCII digit.
 */
export const isDigit = (c: string) => ("0" <= c && c <= "9");

/**
 * Return true if the given character is a whitespace character
 * (either a single space, a `\r`, a `\t`, or a `\n`).
 */
export const isws = (c: string) => (
  c === " " || c === "\r" || c === "\t" || c === "\n"
);

/**
 * Returns true if the given character is a greek letter name.
 */
export const isGreekLetterName = (c: string) => (
  /^(alpha|beta|gamma|delta|epsilon|zeta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|upsilon|phi|chi|psi|omega)/
    .test(c.toLowerCase())
);

/**
 * Returns true if the given character is a Latin or Greek
 * character.
 */
export const isLatinGreek = (c: string) => (
  /^[a-zA-Z_$]/.test(c)
);

// § - Either Type
/**
 * At the parsing stage, all parsed node results are kept
 * in an `Either` type (either an AST node) or an Err (error)
 * object. We want to avoid throwing as much as possible for
 * optimal parsing.
 */
export type Either<A, B> = Left<A> | Right<B>;

/**
 * A `Left` type indicates failure.
 */
export class Left<T> {
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

/**
 * A right type indicates success.
 */
export class Right<T> {
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

/**
 * Returns a new left.
 */
export const left = <T>(x: T): Left<T> => new Left(x);

/**
 * Returns a new right.
 */
export const right = <T>(x: T): Right<T> => new Right(x);

type Fn1 = (a: any) => any;

type VariadicFunction = (...args: any[]) => any;

type Gradual<T extends any[] | readonly any[]> = T extends [...infer R, any]
  ? R["length"] extends 0 ? T
  : T | Gradual<R>
  : T;

type Tup<L extends number, T extends any[] | readonly any[] = []> = T extends
  { length: L } ? T : Tup<L, [...T, any]>;

type Curry<
  Function extends VariadicFunction,
  Length extends number = Parameters<Function>["length"],
> = <Args extends Gradual<Parameters<Function>>>(
  ...args: Args
) => Args["length"] extends Length ? ReturnType<Function>
  : Curry<
    (
      ...args: Slice<Parameters<Function>, Args["length"]>
    ) => ReturnType<Function>
  >;

export type Slice<
  T extends any[] | readonly any[],
  C extends number,
> = T["length"] extends C ? T
  : T extends readonly [...Tup<C>, ...infer S] ? S
  : T extends [...Tup<C>, ...infer S] ? S
  : T;
export function curry<
  Function extends VariadicFunction,
  Length extends number = Parameters<Function>["length"],
>(
  fn: Function,
  length = fn.length as Length,
): Curry<Function, Length> {
  return <A extends Gradual<Parameters<Function>>>(...args: A) => {
    const argsLength = args.length;

    if (argsLength === length) {
      return fn(...args);
    }

    if (argsLength > length) {
      return fn(...args.slice(0, length));
    }

    return curry(
      (...nextArgs) => fn(...args.concat(nextArgs)),
      length - argsLength,
    );
  };
}

type Head<T extends any[]> = T extends [infer H, ...infer _] ? H
  : never;

type Last<T extends any[]> = T extends [infer _] ? never
  : T extends [...infer _, infer Tl] ? Tl
  : never;

type Allowed<
  T extends Fn1[],
  Cache extends Fn1[] = [],
> = T extends [] ? Cache
  : T extends [infer Lst]
    ? Lst extends Fn1 ? Allowed<[], [...Cache, Lst]> : never
  : T extends [infer Fst, ...infer Lst]
    ? Fst extends Fn1
      ? Lst extends Fn1[]
        ? Head<Lst> extends Fn1
          ? Head<Parameters<Fst>> extends ReturnType<Head<Lst>>
            ? Allowed<Lst, [...Cache, Fst]>
          : never
        : never
      : never
    : never
  : never;

type LastParameterOf<T extends Fn1[]> = Last<T> extends Fn1
  ? Head<Parameters<Last<T>>>
  : never;

type Return<T extends Fn1[]> = Head<T> extends Fn1 ? ReturnType<Head<T>>
  : never;

export function compose<
  T extends Fn1,
  Fns extends T[],
  Allow extends {
    0: [never];
    1: [LastParameterOf<Fns>];
  }[Allowed<Fns> extends never ? 0 : 1],
>(...args: [...Fns]): (...data: Allow) => Return<Fns>;
export function compose<
  T extends Fn1,
  Fns extends T[],
  Allow extends unknown[],
>(...args: [...Fns]) {
  return (...data: Allow) => args.reduceRight((acc, elem) => elem(acc), data);
}

type FirstParameterOf<T extends Fn1[]> = Head<T> extends Fn1
  ? Head<Parameters<Head<T>>>
  : never;

export function pipe<
  T extends Fn1,
  Fns extends T[],
  Allow extends {
    0: [never];
    1: [FirstParameterOf<Fns>];
  }[Allowed<Fns> extends never ? 0 : 1],
>(...args: [...Fns]): (...data: Allow) => Return<Fns>;
export function pipe<T extends Fn1, Fns extends T[], Allow extends unknown[]>(
  ...args: [...Fns]
) {
  return (...data: Allow) => args.reduce((acc, elem) => elem(acc), data);
}

export class Box<T> {
  value: T;
  constructor(x: T) {
    this.value = x;
  }
  map<U>(f: (x: T) => U) {
    return new Box(f(this.value));
  }
}

export const box = <T>(x: T) => (
  new Box(x)
);

export class None {
  _tag: "None" = "None";
  constructor() {}
  map(f: (a: never) => unknown): None {
    return this;
  }
  ap(other: never): None {
    return this;
  }
  chain(f: (a: never) => unknown): None {
    return this;
  }
  empty(): this is None {
    return true;
  }
  join() {
    return this;
  }
}

export class Some<T> {
  readonly value: T;
  _tag: "Some" = "Some";
  constructor(value: T) {
    this.value = value;
  }
  empty(): this is never {
    return false;
  }
  map<S>(f: (a: T) => S): Some<S> {
    return new Some(f(this.value));
  }
  chain<S>(f: (a: T) => Some<S>): Some<S> {
    return new Some(f(this.value)).join();
  }
  join() {
    return this.value;
  }
  ap<S>(other: Some<((x: T) => S)>): Some<S> {
    return new Some(other.value(this.value));
  }
}

export const some = <T>(value: T) => (new Some<T>(value));
export const none = () => (new None());

export type Maybe<T> = None | Some<T>;

export function omap<T, S>(f: (a: T) => S, opt: Maybe<T>): Maybe<S> {
  if (opt._tag === "None") {
    return opt;
  } else {
    return some(f(opt.value));
  }
}

/**
 * Returns true if the given argument
 * is undefined.
 */
export const dne = (x: any): x is undefined => (x === undefined);



/**
 * Returns the `a % b`.
 */
export const mod = (a: number, b: number) => (
  ((a % b) + b) % b
);

/**
 * Returns the floor division of a and b.
 */
export const quot = (a: number, b: number) => (
  floor(a / b)
);

/**
 * Returns the a% of b.
 */
export const percent = (a: number, b: number) => (
  (100 * a) / b
);

/**
 * Converts the provided number into a pair of integers (N,D),
 * where `N` is the numerator and `D` is the
 * denominator.
 */
export const toFrac = (numberValue: number): [number, number] => {
  if (Number.isInteger(numberValue)) return [numberValue, 1];
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
  return [h, abs(k)];
};

/**
 * Returns the greatest common denominator
 * of the provided integers `a` and `b`.
 */
export const gcd = (a: number, b: number) => {
  a = Math.floor(a);
  b = Math.floor(b);
  let t = a;
  while (b !== 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return abs(a);
};

/**
 * Given a numerator `N` and a denominator `D`,
 * returns a simplified fraction.
 */
export const simplify = ([N, D]: [number, number]): [number, number] => {
  const sgn = sign(N) * sign(D);
  const n = abs(N);
  const d = abs(D);
  const f = gcd(n, d);
  return [(sgn * n) / f, abs(d / f)];
};

/**
 * Returns the starting index of `target` in `subject`.
 * If the target is the empty string, returns the length
 * of the subject (given that all strings contain the empty string).
 * If the subject does not contain the empty string, returns `-1`.
 * Otherwise, returns the starting index of the target.
 *
 * @param subject - The string to look for target in.
 * @param target - The substring to search for.
 */
export const stringUnion = (subject: string, target: string) => {
  const H = subject.length;
  const N = target.length;
  if (N === 0) return H;
  // longest prefix suffix array
  const lps = new Array(N).fill(0);
  // previous longest prefix suffix
  let prevLPS = 0;
  let i = 1;
  while (i < N) {
    if (target[i] === target[prevLPS]) {
      lps[i] = prevLPS + 1;
      prevLPS += 1;
      i += 1;
    } else if (prevLPS === 0) {
      lps[i] = 0;
      i += 1;
    } else {
      prevLPS = lps[prevLPS - 1];
    }
  }
  i = 0;
  let j = 0;
  while (i < H) {
    if (subject[i] === target[j]) {
      i = i + 1;
      j = j + 1;
    } else {
      if (j === 0) {
        i += 1;
      } else {
        j = lps[j - 1];
      }
    }
    if (j === N) {
      return i - N;
    }
  }
  return -1;
};

/**
 * An identity function. Takes whatever
 * argument it’s given and returns it.
 */
export const id = <T>(x: T) => x;

/**
 * Returns true if the given value is
 * a number.
 */
export const isnum = (x: any): x is number => (
  (typeof x === "number") &&
  (Number.isFinite(x)) &&
  (!Number.isNaN(x))
);

/**
 * Returns true if the given number is an
 * integer.
 */
export const isINT = (x: number) => (isnum(x)) && (Number.isInteger(x));

/**
 * Returns true if the given number is not
 * an integer.
 */
export const isFLOAT = (x: number) => !(isINT(x));

/**
 * Returns true if the given number is 1.
 */
export const is1 = (x: number) => (isnum(x)) && (x === 1);
/**
 * Returns true if the given number is 0.
 */
export const is0 = (x: number) => (isnum(x)) && (x === 0);
/**
 * Parses an integer.
 */
export const pInt = (x: string) => (Number.parseInt(x));
/**
 * Parses a float.
 */
export const pFloat = (x: string) => (Number.parseFloat(x));

/**
 * Returns the sign of the given
 * bigint.
 */
// deno-fmt-ignore
export const signB = (x:bigint) => (
  x === (0n) ? (0n) 
    : x > (0n) ? (1n)
    : (-1n)
)

/**
 * Returns the absolute value of the given bigint.
 */
export const absB = (x: bigint) => (
  x < 0n ? x * -1n : x
);
type n2 = [number, number];

/**
 * Returns true if the given pair
 * of numbers (presumed to be fractions)
 * are equal.
 */
export const eqF = (a: n2, b: n2) => {
  const A = simplify(a);
  const B = simplify(b);
  return (A[0] === B[0] && A[1] === B[1]);
};

/**
 * Returns the product of the given
 * pair of numbers (presumed to be
 * fractions).
 */
export const mulF = (fraction1: n2, fraction2: n2) => (
  simplify([
    fraction1[0] * fraction2[0],
    fraction1[1] * fraction2[1],
  ])
);

/**
 * Returns the quotient of the given
 * pair of numbers (presumed to be
 * fractions.)
 */
export const divF = (fraction1: n2, fraction2: n2) => (
  simplify([
    fraction1[0] * fraction2[1],
    fraction1[1] * fraction2[0],
  ])
);

/**
 * Returns the sum of the given
 * pair of numbers (presumed to be
 * fractions).
 */
export const addF = (fraction1: n2, fraction2: n2) => (
  simplify([
    fraction1[0] * fraction2[1] + fraction2[0] * fraction1[1],
    fraction1[1] * fraction2[1],
  ])
);

/**
 * Returns the difference of the given
 * pair of numbers (presumed to be fractions).
 */
export const subF = (fraction1: n2, fraction2: n2) => (
  simplify([
    fraction1[0] * fraction2[1] - fraction2[0] * fraction1[1],
    fraction1[1] * fraction2[1],
  ])
);
const iof = (n: n2) => n[1];
const rof = (n: n2) => n[0];
/**
 * Returns the sum of the given pair
 * of numbers (presumed to be complex numbers).
 */
export const addC = (
  complex1: n2,
  complex2: n2,
): n2 => [rof(complex1) + rof(complex2), iof(complex1) + iof(complex2)];

export class Complex {
  r: number;
  i: number;
  constructor(r: number, i: number) {
    this.r = r;
    this.i = i;
  }
  get is1() {
    return this.i === 0 && this.r === 1;
  }
  get is0() {
    return this.i === 0 && this.r === 0;
  }
  get pair(): [number, number] {
    return [this.i, this.r];
  }
  static from([n, d]: [number, number]) {
    return new Complex(n, d);
  }
  binop(other: Complex, op: (x: n2, y: n2) => n2) {
    return Complex.from(op(this.pair, other.pair));
  }
  add(other: Complex) {
    return this.binop(other, addC);
  }
  toString() {
    return `${this.r} + (${this.i})`;
  }
}

export const complex = ([r, i]: [number, number]) => (
  new Complex(r, i)
);

export class Fraction {
  n: number;
  d: number;
  constructor(n: number, d: number) {
    this.n = n;
    this.d = abs(d);
  }
  copy() {
    return new Fraction(this.n, this.d);
  }
  get pair(): [number, number] {
    return [this.n, this.d];
  }
  static from([n, d]: [number, number]) {
    return new Fraction(n, d);
  }
  binop(other: Fraction, op: (x: n2, y: n2) => n2) {
    return Fraction.from(op(this.pair, other.pair));
  }
  add(other: Fraction) {
    return this.binop(other, addF);
  }
  sub(other: Fraction) {
    return this.binop(other, subF);
  }
  mul(other: Fraction) {
    return this.binop(other, mulF);
  }
  div(other: Fraction) {
    return this.binop(other, divF);
  }
  get is1() {
    return this.n === this.d;
  }
  get is0() {
    return this.n === 0;
  }
  toString() {
    return `${this.n}/${this.d}`;
  }
}

export const frac = ([n, d]: [number, number]) => (
  new Fraction(n, d)
);
export const isarray = Array.isArray;
export const isstring = (x: any): x is string => (typeof x === "string");
export const isnumber = (x: any): x is number => (typeof x === "number");
export const isboolean = (x: any): x is boolean => (typeof x === "boolean");
export const isset = (x: any): x is Set<any> => (x instanceof Set);
