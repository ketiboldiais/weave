type Fn1 = (a: any) => any;

type VariadicFunction = (...args: any[]) => any;

type Gradual<T extends any[] | readonly any[]> = T extends [...infer R, any]
  ? R["length"] extends 0 ? T
  : T | Gradual<R>
  : T;

type Tup<L extends number, T extends any[] | readonly any[] = []> = T extends
  { length: L } ? T : Tup<L, [...T, any]>;

export type Curry<
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

function curry<
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

function compose<
  T extends Fn1,
  Fns extends T[],
  Allow extends {
    0: [never];
    1: [LastParameterOf<Fns>];
  }[Allowed<Fns> extends never ? 0 : 1],
>(...args: [...Fns]): (...data: Allow) => Return<Fns>;

function compose<
  T extends Fn1,
  Fns extends T[],
  Allow extends unknown[],
>(...args: [...Fns]) {
  return (...data: Allow) => args.reduceRight((acc, elem) => elem(acc), data);
}

type FirstParameterOf<T extends Fn1[]> = Head<T> extends Fn1
  ? Head<Parameters<Head<T>>>
  : never;

function pipe<
  T extends Fn1,
  Fns extends T[],
  Allow extends {
    0: [never];
    1: [FirstParameterOf<Fns>];
  }[Allowed<Fns> extends never ? 0 : 1],
>(...args: [...Fns]): (...data: Allow) => Return<Fns>;
function pipe<T extends Fn1, Fns extends T[], Allow extends unknown[]>(
  ...args: [...Fns]
) {
  return (...data: Allow) => args.reduce((acc, elem) => elem(acc), data);
}

class Box<T> {
  value: T;
  constructor(x: T) {
    this.value = x;
  }
  map<U>(f: (x: T) => U) {
    return new Box(f(this.value));
  }
}

const box = <T>(x: T) => (
  new Box(x)
);

class None {
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

class Some<T> {
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

const some = <T>(value: T) => (new Some<T>(value));
const none = () => (new None());

type Maybe<T> = None | Some<T>;

function map<T, S>(f: (a: T) => S, opt: Maybe<T>): Maybe<S> {
  if (opt._tag === "None") {
    return opt;
  } else {
    return some(f(opt.value));
  }
}

