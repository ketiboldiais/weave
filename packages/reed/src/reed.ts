const LOWER_LETTERS = /^[a-z]/;
const UPPER_LETTERS = /^[A-Z]/;
const DIGITS = /^[0-9]/;

function cached<Out>(
  f: (state: ParseState<any>) => ParseState<Out>,
): Pattern<Out> {
  let cache: Record<number, ParseState<Out>> = {};
  let cache_text = "";
  return (state) => {
    const { text, index } = state;
    if (text != cache_text) {
      cache = {};
      cache_text = text;
    }
    if (!(index in cache)) {
      const res = f(state);
      cache[index] = res;
    }
    const out = cache[index];
    // const out = f(state);
    return out;
  };
}

class Maybe<T> {
  value: T | null;
  constructor(value: T | null) {
    this.value = value;
  }
  isNothing() {
    return this.value === null || this.value === undefined;
  }
  static some<X>(value: X) {
    return new Maybe(value);
  }
  static none<X>() {
    return new Maybe<X>(null);
  }
  static of<X>(value: X | null): Maybe<X> {
    return value ? Maybe.some(value) : Maybe.none<X>();
  }
  concat<U>(other: Maybe<U>) {
    if (this.isNothing()) {
      return Maybe.none<[T, U]>();
    }
    if (other.isNothing()) {
      return Maybe.none<[T, U]>();
    }
    const t = this.value as T;
    const u = other.value as U;
    return Maybe.some<[T, U]>([t, u]);
  }
  fn(f: (value: T) => void) {
    if (this.isNothing()) return this;
    f(this.value as T);
    return this;
  }
  unwrap(fallback: T) {
    if (this.isNothing()) return fallback;
    return this.value as NonNullable<T>;
  }
  map<K>(f: (value: T) => K) {
    return this.value === null
      ? (this as unknown as Maybe<K>)
      : Maybe.of<K>(f(this.value));
  }
}

export const box = <T>(value?: T | null) => Maybe.of(value);

export type ParseState<T> = {
  readonly text: string;
  index: number;
  result: Maybe<T>;
  error?: string;
};

const genesis = <T>(text: string): ParseState<T> => ({
  text,
  index: 0,
  result: Maybe.none<T>(),
});

const success = <A, B>(
  previousState: ParseState<A>,
  result: B,
): ParseState<B> => ({
  ...previousState,
  result: Maybe.of(result),
});

const enstate = <T>(
  previousState: ParseState<any>,
  result: T,
  index: number,
): ParseState<T> => ({
  ...success(previousState, result),
  index,
});

const failure = <T>(
  previousState: ParseState<any>,
  error: string,
): ParseState<T> => ({
  ...previousState,
  result: Maybe.none(),
  error,
});

const erratum = (
  parserName: string,
  message: string,
) => `Error[${parserName}]: ${message}`;

type Pattern<Out> = (state: ParseState<any>) => ParseState<Out>;

export class P<Out> {
  readonly p: Pattern<Out>;
  constructor(p: Pattern<Out>) {
    this.p = cached(p);
  }
  tie() {
    const p = this.p;
    return new P<string>((state) => {
      if (state.error) return state;
      const res = p(state);
      const out = res.result.map((r) => {
        if (Array.isArray(r)) return success(res, r.join(""));
        return failure(res, erratum("tie", "called tie on non-array"));
      });
      return out.unwrap(state);
    });
  }
  parse(text: string) {
    const state = genesis(text);
    return this.p(state);
  }

  map<NewOut>(f: (result: Out) => NewOut) {
    const p = this.p;
    return new P<NewOut>((state) => {
      if (state.error) return state;
      const newstate = p(state);
      const result = newstate.result.map(f);
      return success(newstate, result.value);
    });
  }

  chain<T>(f: (x: Out) => P<T>) {
    const p = this.p;
    return new P<T>((state) => {
      if (state.error) return state;
      const next = p(state);
      if (next.error) return next;
      const out = next.result.map((v) => f(v).p(next));
      return out.unwrap(state);
    });
  }

  /**
   * Returns a parser that successfully matches only if
   * at least one of this parser or other successfully matches.
   * If this parser succeeds, returns a result of type A.
   * If `other` succeeds, returns a result of type B.
   * If neither succeeds, returns an error.
   * Equivalent to a logical `OR` skim.
   *
   * @param other - The second prong of the pattern.
   */
  or<Other>(other: P<Other>) {
    const p = this.p;
    return new P<Out | Other>((state) => {
      if (state.error) return state;
      const r1 = p(state);
      if (!r1.error) return r1;
      const r2 = other.p(state);
      if (!r2.error) return r2;
      const msg = `Expected at least one match.`;
      const erm = erratum("Parser.or", msg);
      return failure(state, erm);
    });
  }

  /**
   * Returns a skimmer that successfully skims only if
   * this skimmer and the provided `pattern` both successfully match.
   * The result is a pair `[A,B]`, where `A` is the result type of
   * this skimmer, and `B` is the result type of `pattern`.
   * Equivalent to a logical `AND` skim.
   *
   * @param pattern - The second prong of the pattern.
   */
  and<Out2>(pattern: P<Out2>) {
    const p = this.p;
    return new P<[Out, Out2]>((state) => {
      if (state.error) return state;
      const msg = `Expected two matches.`;
      const err = erratum("and", msg);
      const r1 = p(state);
      if (r1.error) return failure(r1, err);
      const r2 = pattern.p(r1);
      if (r2.error) return failure(r2, err);
      const out = r1.result.concat(r2.result).map((v) => success(r2, v));
      return out.unwrap(state);
    });
  }

  /**
   * Applies this parser exactly
   * _n_ times, returning an _n_-tuple
   * of the results. If the tuple
   * is not of length _n_, returns
   * an error.
   */
  times(n: number) {
    const p = this.p;
    return new P<Out[]>((state) => {
      if (state.error) return state;
      const count = Math.abs(Math.floor(n));
      const result: Out[] = [];
      let newstate = state;
      for (let i = 0; i < count; i++) {
        const out = p(state);
        if (out.error) return out;
        newstate = out;
        newstate.result.fn((v) => result.push(v));
      }
      if (result.length !== count) {
        const msg = `Expected n matches, but got ${result.length}.`;
        const erm = erratum(`Parser.times`, msg);
        return failure(state, erm);
      }
      return success(newstate, result);
    });
  }
}

type UnwrapP<T> = T extends P<infer U> ? U : T;
type UnwrapPs<T extends [...any[]]> = T extends [infer Head, ...infer Tail]
  ? [UnwrapP<Head>, ...UnwrapPs<Tail>]
  : [];
type TailP<T extends [...any[]]> = T extends [...any[], infer Tail] ? Tail
  : never;
type HeadP<T extends [...any[]]> = T extends [infer Head, ...any[]] ? Head
  : never;

/**
 * Give the list of parsers, runs each parser
 * in sequence from first to last, passing the output state
 * of the previous parser to the next. The resulting
 * state holds the result of the last parser.
 */
export const piped = <T extends [...P<any>[]]>(
  patterns: [...T],
) =>
  new P<UnwrapP<TailP<T>>>((state) => {
    let next = state;
    const L = patterns.length;
    for (let i = 0; i < L; i++) {
      next = patterns[i].p(next);
    }
    return next;
  });

/**
 * Give the list of parsers, runs each parser
 * in sequence from last to first, passing the output state
 * of the previous parser to the next. The resulting
 * state holds the result of the first parser.
 */
export const composed = <T extends [...P<any>[]]>(
  patterns: [...T],
) =>
  new P<UnwrapP<HeadP<T>>>((state) => {
    return piped([...patterns].reverse()).p(state);
  });

/**
 * Matches the given string exactly,
 * white-space sensitive. If no match is found,
 * the error state’s result is an empty string.
 * @param pattern - The expected character.
 */
export const one = (pattern: string) =>
  new P<string>(
    (state) => {
      if (state.error) return state;
      const { text, index } = state;
      const subject = text.slice(index);
      if (subject.startsWith(pattern)) {
        return enstate(state, pattern, state.index + pattern.length);
      }
      const msg = `Expected “${pattern}”, got ${subject[index]}`;
      return failure(state, msg);
    },
  );

/**
 * Matches the given string exactly,
 * _white-space insensitive_. If no match is found,
 * the error state’s result is an empty string.
 * @param pattern - The expected character.
 */
export const lit = (pattern: string) =>
  new P<string>((state) => {
    if (state.error) return state;
    const { text, index } = state;
    const subject = text.slice(index);
    const target = subject.trimStart();
    const l = subject.length - target.length;
    if (target.startsWith(pattern)) {
      return enstate(state, pattern, state.index + pattern.length + l);
    }
    const msg = `Expected “${pattern}”, got ${subject[index]}`;
    return failure(state, msg);
  });

/**
 * Returns a parser that must match the given list of patterns
 * exactly. If a single parser fails, an error is returned.
 *
 * @param patterns - A list of rules to match.
 */
export const list = <T extends [...P<any>[]]>(
  patterns: [...T],
) =>
  new P<UnwrapPs<T>>(
    (state) => {
      if (state.error) return state;
      const results = [];
      let newState = state;
      const R = patterns.length;
      for (let i = 0; i < R; i++) {
        newState = patterns[i].p(newState);
        if (newState.error) {
          const msg = `A required rule failed: ${newState.error}`;
          const erm = erratum("chain", msg);
          return failure(state, erm);
        }
        if (!newState.result.isNothing()) {
          const res = newState.result.value;
          results.push(res);
        }
      }
      const output = success(newState, results);
      return output;
    },
  );

/**
 * Returns a parser that matches the given list of rules.
 * The result will hold either an array of results from
 * the rules successfully matched or an empty array
 * if no rule is matched. Note that a `some` parser
 * never fails – a result array is always returned.
 * @param rules - A list of rules to match.
 */
export const some = <T extends [...P<any>[]]>(
  patterns: [...T],
) =>
  new P<UnwrapPs<T>>((state) => {
    const results = [];
    if (state.error) return state;
    let newstate = state;
    const L = patterns.length;
    for (let i = 0; i < L; i++) {
      newstate = patterns[i].p(newstate);
      if (!newstate.result.isNothing()) {
        const res = newstate.result.value;
        results.push(res);
      }
    }
    const output = success(newstate, results);
    return output;
  });

/**
 * Returns a parser that returns a successful on the first
 * matched pattern. If not a single match is found
 * from the list of patterns, returns an error.
 *
 * @param patterns - A list of patterns to match.
 */
export const choice = <T extends any[], A extends P<[...T][number]>[]>(
  patterns: [...A],
) =>
  new P<(A extends P<infer T>[] ? T : never)>((state) => {
    if (state.error) return state;
    const R = patterns.length;
    for (let i = 0; i < R; i++) {
      const parsing = patterns[i].p(state);
      if (!parsing.error) return parsing;
    }
    const msg = `Expected at least one match.`;
    const error = erratum("choice", msg);
    return failure(state, error);
  });

/**
 * Returns a parser that matches the given rule as
 * many times as possible, ceasing at the first failed rule.
 * The skimmer will hold either an array of results from
 * the successful matches, or an empty array.
 *
 * @param pattern - The pattern to match.
 */
export const many = <T>(pattern: P<T>) =>
  new P<T[]>((state) => {
    if (state.error) return state;
    const results: T[] = [];
    let next = state;
    const max = state.text.length;
    let i = state.index;
    while (!next.error && i < max) {
      i++;
      const out = pattern.p(next);
      if (out.error) break;
      else {
        next = out;
        const result = next.result.value;
        results.push(result);
      }
      if (i >= max) break;
    }
    return success(next, results);
  });

/**
 * Returns a parser that optionally matches
 * the given rule. If no match is found,
 * returns a skimmer whose result is `nothing`, and
 * the subsequent skimmer will pick up at its index.
 * If a match is found, returns a skimmer whose
 * result is type `T`.
 *
 * @param pattern - The pattern to match.
 */
export const maybe = <T>(pattern: P<T>) =>
  new P<T | string>((state) => {
    if (state.error) return state;
    const next = pattern.p(state);
    const result = next.error ? success(state, "") : next;
    return result;
  });

/**
 * Returns a parser that skips the given
 * rule in the event of a match. If a match
 * is found, the result is `null` (prompting
 * sequential parsers such as `list` and `many`
 * to ignore its result). If a match
 * is not found, returns the next state.
 *
 * @param pattern - The pattern to ignore.
 */
export const skip = <T>(pattern: P<T>) =>
  new P<T>((state) => {
    if (state.error) return state;
    const next = pattern.p(state);
    if (next.error) return next;
    return success(next, "");
  });

/**
 * Parses the content between two patterns, `P<A>` and `P<B>`.
 * If no match is found, returns a result of nothing. Otherwise,
 * returns the result of `P<C>`, the content skimmer. Useful
 * for skimming delimited content.

 * @param left - The left delimiter pattern. E.g., `(`.
 * @param right - The right delimiter pattern. E.g., `)`.
 * @returns A function that takes a parser for the delimited content.
 */
export const amid = <A, B>(left: P<A>, right: P<B>) => <C>(content: P<C>) =>
  list([left, content, right]).map(([_, c]) => c);

/**
 * Returns a parser for content separated by the given
 * separator. Useful for parsing comma-separated input.
 *
 * @param separator - The separator’s skimmer. E.g., `,`.
 * @returns A function that takes a content parser.
 */
export const sepby = <S>(
  separator: P<S>,
) =>
<T>(content: P<T>) =>
  new P<T[]>((state) => {
    if (state.error) return state;
    let next = state;
    let error;
    const results = [];
    const max = state.text.length;
    while (next.index < max) {
      const valstate = content.p(next);
      const sepstate = separator.p(valstate);
      if (valstate.error) {
        error = valstate;
        break;
      } else {
        if (!valstate.result.isNothing()) {
          results.push(valstate.result.value);
        }
      }
      if (sepstate.error) {
        next = valstate;
        break;
      }
      next = sepstate;
    }
    if (error) {
      if (results.length === 0) {
        return success(state, results as T[]);
      }
      return error;
    }
    return success(state, results);
  });

/**
 * Returns a parser that runs according
 * to the given regular expression. The
 * regular expression must begin with `^`.
 * Otherwise, an error is returned.
 *
 * @param pattern - The regular expression
 * the skimmer should follow.
 */
export const regex = (pattern: RegExp) =>
  new P<string>((state) => {
    if (state.error) return state;
    if (pattern.source[0] !== "^") {
      const msg = `Regular expressions must begin with ^`;
      const erm = erratum("regex", msg);
      return failure(state, erm);
    }
    const { text, index } = state;
    const target = text.slice(index);
    const match = target.match(pattern);
    if (match) {
      const result = match[0];
      const newindex = result.length + index;
      return enstate(state, result, newindex);
    }
    const msg = `No match on regex pattern [${pattern.source}]`;
    const erm = erratum(`regex`, msg);
    return failure(state, erm);
  });

/**
 * Given an array of patterns returning string
 * results, returns the matched result as a
 * single string. Equivalent to calling:
 *
 * @example
 * ~~~
 * list(patterns).map((result) => result.join(""))
 * ~~~
 */
export const word = (patterns: P<string>[]) =>
  list(patterns).map((result) => result.join(""));

/**
 * Returns a successful result on any character.
 */
export const anychar = () =>
  new P((state) => {
    if (state.error) return state;
    const { text, index } = state;
    const result = text.slice(index, text.length - 1);
    return enstate(state, result, state.index + result.length);
  });

/**
 * Given the array of patterns, returns a
 * successful match with a result of type string,
 * provided none of the provided patterns
 * successfully match.
 */
export const anybut = <T>(patterns: P<T>[]) =>
  new P((state) => {
    if (state.error) return state;
    const L = patterns.length;
    const { text } = state;
    let next = state;
    for (let i = 0; i < L; i++) {
      next = patterns[i].p(next);
      if (!next.error) {
        const msg = `Prohibited pattern matched.`;
        const erm = erratum(`anybug`, msg);
        return failure(state, erm);
      }
    }
    const result = text.slice(next.index, text.length - 1);
    const newstate = enstate(state, result, state.index + result.length);
    return newstate;
  });

/**
 * Matches on any whitespace.
 */
export const ws = regex(/^\s+/);

/**
 * Given the provided callback that
 * returns a parser of result type T,
 * returns the parser when called.
 * Necessary for handling recursive
 * patterns.
 */
export const thunk = <T>(pattern: () => P<T>) =>
  new P<T>((state) => {
    return pattern().p(state);
  });

/**
 * Matches __one__ Latin character.
 *
 * @param option - Either of the following strings:
 * - `lower` - matches a Latin character from `a` through `z`.
 * - `upper` - matches a Latin character from `A` through `Z`.
 * - `any` (default) - matches any lower- or upper-case character.
 */
export const latin = (
  option: "lower" | "upper" | "any" = "any",
) => {
  switch (option) {
    case "lower":
      return regex(LOWER_LETTERS);
    case "upper":
      return regex(UPPER_LETTERS);
    default:
      return regex(LOWER_LETTERS).or(regex(UPPER_LETTERS));
  }
};
/**
 * Matches __one__ ascii digit (digits 0 through 9).
 */
export const digit = regex(DIGITS);
/**
 * Matches multiple ascii latin characters.
 */
export const letters = many(latin("any"));
/**
 * Matches multiple ascii digits.
 */
export const digits = many(digit);

/**
 * Matches all ascii characters. An optional
 * filter may be passed to modify the result.
 * @example
 * ~~~
 * const p = ascii((s)=>s!==" ").parse("asd24aa s92a");
 * // result: "asd24aas92a"
 * ~~~
 */
export const ascii = () => {
  const out = many(digit.or(latin("any")));
  return out;
};

