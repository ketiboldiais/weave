/**
 * @file
 * This file contains various utility and helper
 * functions used by the engine.
 */

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
 * Utility function for printing the AST.
 */
export function strTree<T extends Object>(
  Obj: T,
  cbfn?: (node: any) => void,
) {
  const prefix = (key: keyof T, last: boolean) => {
    let str = last ? "└" : "├";
    if (key) str += "─ ";
    else str += "──┐";
    return str;
  };
  const getKeys = (obj: T) => {
    const keys: (keyof T)[] = [];
    for (const branch in obj) {
      if (!obj.hasOwnProperty(branch) || typeof obj[branch] === "function") {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  };
  const grow = (
    key: keyof T,
    root: any,
    last: boolean,
    prevstack: ([T, boolean])[],
    cb: (str: string) => any,
  ) => {
    cbfn && cbfn(root);
    let line = "";
    let index = 0;
    let lastKey = false;
    let circ = false;
    let stack = prevstack.slice(0);
    if (stack.push([root, last]) && stack.length > 0) {
      prevstack.forEach(function (lastState, idx) {
        if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
        if (!circ && lastState[0] === root) circ = true;
      });
      line += prefix(key, last) + key.toString();
      if (typeof root !== "object") line += ": " + root;
      circ && (line += " (circular ref.)");
      cb(line);
    }
    if (!circ && typeof root === "object") {
      const keys = getKeys(root);
      keys.forEach((branch) => {
        lastKey = ++index === keys.length;
        grow(branch, root[branch], lastKey, stack, cb);
      });
    }
  };
  let output = "";
  const obj = Object.assign({}, Obj);
  grow(
    "." as keyof T,
    obj,
    false,
    [],
    (line: string) => (output += line + "\n"),
  );
  return output;
}

export const { floor, ceil, abs, cos, sin, sign, pow, expm1 } = Math;

export const mod = (a: number, b: number) => (
  ((a % b) + b) % b
);

export const quot = (a: number, b: number) => (
  floor(a / b)
);

export const percent = (a: number, b: number) => (
  (100 * a) / b
);

export const print = console.log;

const pm = (c: string) => (
  Number.parseFloat(c + "1")
);
const exp10 = (n: number) => (10 ** n);

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
  return [h, k];
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

const id = <T>(x: T) => x;

// deno-fmt-ignore
const binop = (op: (a: number, b: number) => number, and: (f: number) => number = id) => (
  [a, b]: [number, number]) => (op(a, b)
);

// deno-fmt-ignore
const pairOp2 = (binop:((x1:number, y1:number, x2:number, y2:number) => [number,number]), and: (f: [number,number]) => [number, number] = id) => (
  [a,b]:[number, number],
  [c,d]:[number,number],
) => (
  and(binop(a, b, c, d))
)

/**
 * Returns the rational product of the given pair of numbers (interpreted
 * as rationals).
 */
export const mulF = pairOp2((a, b, c, d) => [a * c, b * d], simplify);

/**
 * Returns the rational quotient of the given pair of numbers (interpreted
 * as rationals; no checks for zero denominators).
 */
export const divF = pairOp2((a, b, c, d) => [a * d, b * c], simplify);

/**
 * Returns the rational sum of the given pair of numbers (interpreted
 * as rationals).
 */
export const addF = pairOp2(
  (n1, d1, n2, d2) => [(n1 * d2) + (n2 * d1), d1 * d2],
  simplify,
);

/**
 * Returns the rational difference of the given pair of numbers (interpreted
 * as rationals).
 */
export const subF = pairOp2(
  (n1, d1, n2, d2) => [(n1 * d2) - (n2 * d1), d1 * d2],
  simplify,
);

const nthroot = (x: number, n: number): [number, number] => {
  if (x === 1) return [1, 1];
  if (x === 0) return [0, 1];
  if (x < 0) return [1, 0];
  const initEstimate = toFrac(pow(x, 1 / n));
  const ITERATIONS = 3;
  return [...new Array(ITERATIONS)].reduce((r) => {
    return simplify([
      ((n - 1) * pow(r[0], n)) + (x * pow(r[1], n)),
      n * r[1] * pow(r[0], n - 1),
    ]);
  }, initEstimate);
};

const invertF = ([a, b]: [number, number]) => simplify([b, a]);
const absF = ([a, b]: [number, number]) => simplify([abs(a), abs(b)]);

export const powF = (
  [n1, d1]: [number, number],
  power: [number, number] | number,
): [number, number] => {
  const [n2, d2] = typeof power === "number" ? toFrac(power) : power;
  const [nN, nD] = simplify([n2, d2]);
  const [numer, denom] = simplify([n1, d1]);
  if (nN < 0) return powF(invertF([numer, denom]), absF([nN, nD]));
  if (nN === 0) return [1, 1];
  if (nD === 1) return [numer ** nN, denom ** nN];
  if (numer < 0 && nD !== 1) return [Infinity, Infinity];
  const [newN, newD] = divF(nthroot(numer, nD), nthroot(denom, nD));
  return simplify([pow(newN, nN), pow(newD, nN)]);
};


