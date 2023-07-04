export class None {
  _tag: "None" = "None";
  constructor() {}
  map(f: (a: never) => unknown): None {
    return new None();
  }
}

export class Some<T> {
  readonly value: T;
  _tag: "Some" = "Some";
  constructor(value: T) {
    this.value = value;
  }
  map<S>(f: (a: T) => S): Some<S> {
    return new Some(f(this.value));
  }
}

export const some = <T>(value: T) => (new Some<T>(value));
export const none = () => (new None());

export type Option<T> = None | Some<T>;

export function map<T, S>(f: (a: T) => S, opt: Option<T>): Option<S> {
  if (opt._tag === "None") {
    return opt;
  } else {
    return some(f(opt.value));
  }
}
