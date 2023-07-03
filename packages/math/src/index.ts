/**
 * Converts the provided number (assumed to be radians) to degrees.
 */
export const toDegrees = (radians: number) => radians * (180 / Math.PI);

/**
 * Converts the provided number (assumed to be degrees) to radians.
 */
export const toRadians = (degrees: number) => degrees * (Math.PI / 180);

/**
 * Returns a random integer between the provided minimum
 * and maximum (not including the maximum).
 */
export const randInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Returns a random floating point number between the
 * provided minimum and maximum (not including the maximum).
 */
export const randFloat = (min: number, max: number) => {
  return Math.random() * (max - min) + min;
};

/**
 * Clamps the input number between the minimum and
 * maximum.
 *
 * @param min - The smallest number the input can be.
 * @param input - The number to clamp.
 * @param max - The largest number the input can be.
 */
export const clamp = (
  min: number,
  input: number,
  max: number,
) => Math.min(Math.max(input, min), max);

/**
 * Rounds the given number value to the number of given decimal
 * places.
 *
 * @param value - The number to round.
 * @param decimalPlaces - The number of decimal places.
 */
export const round = (value: number, decimalPlaces: number = 2) => {
  const cap = 10 ** (Math.abs(Math.floor(decimalPlaces)));
  return Math.round((value + Number.EPSILON) * cap) / cap;
};

type PTup = number | string | number[] | string[] | PTup[];

import {
  amid,
  choice,
  list,
  lit,
  maybe,
  one,
  P,
  regex,
  sepby,
  some,
  thunk,
} from "@weave/reed";

function expr(of: string) {
  const POSITIVE_FLOAT = /^(0|[1-9]\d*)(\.\d+)?/;
  const POSITIVE_INTEGER = /^\+?([1-9]\d*)/;
  const NATURAL = /^(0|[1-9]\d*)/;
  const INTEGER = /^-?(0|\+?[1-9]\d*)(?<!-0)/;
  const PI = /^(\u{03c0})/u;
  const LETTER = /^(\w+)/;
  const NATIVE_FN = /^(cos|sin|tan)/;
  const minus = regex(/^(-)/).trim();
  const plus = regex(/^(\+)/).trim();
  const slash = one("/").trim();
  const star = one("*").trim();
  const comma = one(",");
  const caret = one("^").trim();
  const equal = regex(/^=/).trim();
  const notEqualOp = regex(/^(!=)/).trim();
  const comparisonOp = regex(/^(<|>|<=|>=)/).trim();
  const fname = regex(NATIVE_FN);
  const lparen = lit("(");
  const rparen = lit(")");
  const parend = amid(lparen, rparen);
  const commaSeparated = sepby(comma);
  type NodeParser = P<PTup>;

  /**
   * Parses an integer.
   */
  const integer = regex(INTEGER);

  /**
   * Parses an unsigned floating point number.
   */
  const ufloat = regex(POSITIVE_FLOAT);
  const floatingPoint = list([maybe(minus), ufloat]).map((r) => r.join(""));
  const varx = regex(LETTER);
  const number = choice([
    floatingPoint,
    integer,
  ]);

  const binaryExpr = (operator: P<string>) => (parser: P<PTup>) =>
    list([
      parser,
      some(list([operator, parser])),
    ]).map(([init, exprs]) =>
      [init, ...exprs].reduce((acc, curr) => (
        Array.isArray(curr) ? [acc, curr[0], curr[1]] : curr
      ))
    );
  const expression: NodeParser = thunk(() => choice([sum, term]));
  const term: NodeParser = thunk(() => choice([product, factor]));
  const factor: NodeParser = thunk(() => choice([power, exponent]));
  const exponent: NodeParser = thunk(() => primary);
  const primary = choice([
    number.map((r) => (r as any) * 1),
    varx,
    parend(expression),
  ]);
  const sum = binaryExpr(choice([plus, minus]))(term);
  const product = binaryExpr(choice([star, slash]))(factor);
  const power = list([exponent, caret, expression]);
  return expression.parse(of);
}

const p = expr(`3^8 - 2^2`);
console.log(p);
