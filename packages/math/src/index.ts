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

/**
 * Converts the provided number into a pair of integers (N,D),
 * where `N` is the numerator and `D` is the
 * denominator.
 */
export function toFrac(numberValue: number | Real | Fraction) {
  if (typeof numberValue !== "number") {
    if (isNumber(numberValue)) {
      numberValue = numberValue.n;
    } else return numberValue;
  }
  let eps = 1.0E-15;
  let h, h1, h2, k, k1, k2, a, x;
  x = numberValue;
  a = Math.floor(x);
  h1 = 1;
  k1 = 0;
  h = a;
  k = 1;
  while (x - a > eps * k * k) {
    x = 1 / (x - a);
    a = Math.floor(x);
    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;
    h = h2 + a * h1;
    k = k2 + a * k1;
  }
  return frac([h, k]);
}

/**
 * Returns the greatest common denominator
 * of the provided integers `a` and `b`.
 */
export function gcd(a: number, b: number) {
  a = Math.floor(a);
  b = Math.floor(b);
  let t = a;
  while (b !== 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
}

/**
 * Given a numerator `N` and a denominator `D`,
 * returns a simplified fraction.
 */
export function simplify(fraction: Fraction) {
  const N = fraction.n;
  const D = fraction.d;
  const sgn = Math.sign(N) * Math.sign(D);
  const n = Math.abs(N);
  const d = Math.abs(D);
  const f = gcd(n, d);
  return frac([(sgn * n) / f, (sgn * d) / f]);
}

const binop = <T>(
  numFn: (a: number, b: number) => T,
  fracFn: (a: Fraction, b: Fraction) => T,
) =>
(a: number | Fraction | Real, b: number | Fraction | Real) => (
  (typeof a === "number" && typeof b === "number")
    ? numFn(a, b)
    : fracFn(toFrac(a), toFrac(b))
);

const eq = binop(
  (a, b) => a === b,
  (n, d) => {
    const a = simplify(n);
    const b = simplify(d);
    return (
      a.n === b.n &&
      a.d === b.d
    );
  },
);

const mul = binop<Numeric>(
  (a, b) => real(a * b),
  (a, b) => simplify(frac([a.n * b.n, a.d * b.d])),
);
const div = binop<Numeric>(
  (a, b) => real(a / b),
  (a, b) => simplify(frac([a.n * b.d, a.d * b.n])),
);
const add = binop<Numeric>(
  (a, b) => real(a + b),
  (a, b) => simplify(frac([a.n * b.d + b.n * a.d, a.d * b.d])),
);
const sub = binop<Numeric>(
  (a, b) => real(a - b),
  (a, b) => simplify(frac([a.n * b.d - b.n * a.d, a.d * b.d])),
);
const pow = binop<Numeric>(
  (a, b) => real(a ** b),
  (a, b) =>
    simplify(frac([(a.n ** (1 / b.d)) ** b.n, (a.d ** (1 / b.d)) ** b.n])),
);

import {
  amid,
  choice,
  list,
  lit,
  many,
  maybe,
  one,
  P,
  regex,
  sepby,
  thunk,
} from "@weave/reed";

export interface Handler<T> {
  real(node: Real): T;
  frac(node: Fraction): T;
  variable(node: Variable): T;
  binex(node: BinaryExpression): T;
  algex(node: AlgebraicExpression): T;
  call(node: CallExpression): T;
  tuple(node: Tuple): T;
  error(node: Erratum): T;
  equation(node: Equation): T;
}

export enum NT {
  real,
  frac,
  variable,
  binex,
  call,
  tuple,
  error,
  equation,
  algex,
}

type NodeParser = P<ParseNode>;

type ParseNode = { type: NT };

type Erratum = { type: NT.error; error: string };
const err = (error: string): Erratum => ({
  error,
  type: NT.error,
});

type Real = { n: number; type: NT.real };
const int = (x: number | string): Real => ({
  n: typeof x === "string" ? Number.parseInt(x) : x,
  type: NT.real,
});
const real = (x: number | string): Real => ({
  n: typeof x === "string" ? Number.parseFloat(x) : x,
  type: NT.real,
});

type Fraction = { n: number; d: number; type: NT.frac };
const frac = ([n, d]: [number, number]): Fraction => ({
  n,
  d,
  type: NT.frac,
});

type Numeric = Real | Fraction;

type BinaryExpression = {
  op: string;
  left: ParseNode;
  right: ParseNode;
  type: NT.binex;
};
const binex = (
  left: ParseNode,
  op: string,
  right: ParseNode,
): BinaryExpression => ({
  left,
  op,
  right,
  type: NT.binex,
});

type AlgebraicExpression = {
  op: string;
  args: ParseNode[];
  type: NT.algex;
};
/**
 * Returns an algebraic expression node.
 */
const algex = (op: string, args: ParseNode[]): AlgebraicExpression => ({
  op,
  args,
  type: NT.algex,
});

type CallExpression = {
  type: NT.call;
  caller: Variable;
  args: Tuple;
};
const call = (
  caller: Variable,
  args: Tuple,
): CallExpression => ({
  caller,
  args,
  type: NT.call,
});

type Tuple = { type: NT.tuple; ns: ParseNode[] };
const tuple = (ns: ParseNode[]): Tuple => ({
  type: NT.tuple,
  ns,
});

type Variable = { n: string; type: NT.variable };
const varx = (n: string): Variable => ({
  n,
  type: NT.variable,
});
const nconst = (n: "pi" | "e"): Variable => ({
  n,
  type: NT.variable,
});

type Equation = {
  type: NT.equation;
  lhs: ParseNode;
  rhs: ParseNode;
};
/**
 * Returns a new equation node.
 */
const eqn = (lhs: ParseNode, rhs: ParseNode): Equation => ({
  lhs,
  rhs,
  type: NT.equation,
});

const POSITIVE_FLOAT = /^(0|[1-9]\d*)(\.\d+)?/;
const POSITIVE_INTEGER = /^\+?([1-9]\d*)/;
const NATURAL = /^(0|[1-9]\d*)/;
const INTEGER = /^-?(0|\+?[1-9]\d*)(?<!-0)/;
const PI = /^(\u{03c0})/u;
const LETTER = /^(\w+)/;
const NATIVE_FN = /^(cos|sin|tan)/;
const addOp = regex(/^(\+|-)/).trim();
const slash = one("/").trim();
const mulOp = regex(/^(\/|\*|rem)/).trim();
const comma = one(",");
const caretOp = one("^").trim();
const equal = regex(/^=/).trim();
const notEqualOp = regex(/^(!=)/).trim();
const comparisonOp = regex(/^(<|>|<=|>=)/).trim();
const fname = regex(NATIVE_FN);
const lparen = lit("(");
const rparen = lit(")");
const parend = amid(lparen, rparen);
const commaSeparated = sepby(comma);

// deno-fmt-ignore
const nodeGuard = <N extends ParseNode>(
  type: NT,
) => (
node: ParseNode
): node is N => (node.type === type);

const isNumber = nodeGuard<Real>(NT.real);
const isNumeric = (node: ParseNode): node is Real | Fraction => (
  node.type === NT.real || node.type === NT.frac
);

/**
 * Parses a positive integer.
 */
export const posint = regex(POSITIVE_INTEGER).map(int);

/**
 * Parses a natural number.
 */
export const natural = regex(NATURAL).map(int);

/**
 * Parses an integer.
 */
export const integer = regex(INTEGER).map(int);

/**
 * Parses the constant π.
 * Succeeds on either `Pi`, `pi`, `PI`, or
 * `π`.
 */
const pi = (choice([
  lit("pi"),
  lit("PI"),
  lit("Pi"),
]).or(regex(PI))).map(() => nconst("pi"));

/**
 * Parses the constant e (Euler’s number).
 * Succeeds on either `e` or `E`.
 */
const euler = lit("e").map(() => nconst("e"));

/**
 * Parses an unsigned floating point number.
 */
export const ufloat = regex(POSITIVE_FLOAT).map(real);

/**
 * Parses a floating point number (possibly
 * signed).
 */
export const float = list([maybe(addOp), ufloat]).map(([s, { n }]) => {
  const res = Number.parseFloat(`${s}${n}`);
  return (res === 0) ? int(0) : (Number.isInteger(res) ? int(res) : real(res));
});

const fraction = list([integer, slash, integer]).map(([n, _, d]) =>
  frac([n.n, d.n])
);
const isFrac = nodeGuard<Fraction>(NT.frac);
const numval = choice([fraction, float, integer, pi, euler]);
const varname = regex(LETTER).map(varx);

const tupleOf = (
  nodeParser: P<ParseNode>,
) => parend(commaSeparated(nodeParser)).map(tuple);
const floats = choice([float, integer, pi, euler]);
const atom: NodeParser = list([
  maybe(lparen),
  choice([numval, varname]),
  maybe(rparen),
]).map(([_, b]) => b);

/**
 * Parses the given input expression. The grammar:
 * ~~~ts
 * expression -> equation
 * equation -> [comparison] (('!=' | '==') [comparison])
 * comparison -> [term] (('>'|'>='|'<'|'>=') term)
 * term -> [factor] (('-'|'+') factor)
 * factor -> [unary] (('/'|'*') unary)
 * unary -> ('!'|'*') unary
 *          | primary
 * primary -> NUMBER | STRING | '(' expression ')'
 * ~~~
 */
function parseExpression(input: string) {
  const binaryExpr = ([left, op, right]: [ParseNode, string, ParseNode]) =>
    binex(
      left,
      op,
      right,
    );
  // const callExpr = ([op, arg]: [string, ParseNode]) => call()
  const expression: NodeParser = thunk(() => equality);
  const equality: NodeParser = thunk(() => equation.or(compare));
  const compare: NodeParser = thunk(() => comparison.or(sum));
	const sum: NodeParser = thunk(() => sumExpression.or(term));
  const term: NodeParser = thunk(() => productExpression.or(factor));
  const factor: NodeParser = thunk(() => unaryExpression.or(primary));
  const primary = choice([float, integer, parend(expression)]);
  const equation = list([primary, equal.or(notEqualOp), expression]).map(
    binaryExpr,
  );
  const comparison = list([primary, comparisonOp, expression]).map(binaryExpr);
  const sumExpression = list([primary, addOp, expression]).map(binaryExpr);
  const productExpression = list([primary, mulOp, expression]).map(binaryExpr);
  const unaryExpression = list([addOp, primary]).map(([op, p]) => p);
	return expression.parse(input);
}

const n = parseExpression(`2 + (3 - 5)`);
console.log(n);



const expr: NodeParser = thunk(() => choice([sumExpr, term]));

const term: NodeParser = thunk(() => choice([mulExpr, factor]));

const factor: NodeParser = thunk(() => choice([powExpr, power]));

const power: NodeParser = thunk(() => choice([callExpr, fnCall]));

const fnCall: NodeParser = thunk(() => choice([atom, parend(expr)]));

const callExpr = (list([
  fname,
  tupleOf(expr),
]).map(([name, args]) => call(varx(name), args)))
  .or(list([varname, expr]).map(([l, r]) => binex(l, "*", r)));

/**
 * Parses a power expression. */
const powExpr = (list([atom, caretOp, expr])).map((
  [left, op, right],
) => (
  binex(left, op, right)
));

/**
 * Parses a multiplicative expression.
 */
const mulExpr = (list([atom, mulOp, expr])).map((
  [left, op, right],
) => (
  binex(left, op, right)
)).or(
  list([floats, maybe(lparen), expr, maybe(rparen)]).map(([l, _, r]) =>
    binex(l, "*", r)
  ),
);

/**
 * Parses a power expression.
 */
const sumExpr = list([atom, addOp, expr]).map((
  [left, op, right],
) => (
  binex(left, op, right)
));

/**
 * Type guard: Returns true if the given node is an
 * algebraic expression, false otherwise.
 */
const isAlgex = nodeGuard<AlgebraicExpression>(NT.algex);

/**
 * Parses an equation.
 */
const pEqn = list([expr, equal, expr]).map(([lhs, _, rhs]) => eqn(lhs, rhs));

/**
 * Parses a given expression.
 */
const prog = choice([pEqn, expr]);

type NameRecord = Record<string, ParseNode>;
class Evaluator implements Handler<ParseNode> {
  env: NameRecord;
  private expression: string;
  erred: null | Erratum = null;
  evaluate() {
    const out = this.evalnode(
      prog.parse(this.expression)
        .result
        .unwrap(err(`Parser failure`)),
    );
    this.erred = null;
    return out;
  }
  constructor(expression: string) {
    this.expression = expression;
    this.env = {
      pi: real(Math.PI),
      e: real(Math.PI),
    };
  }
  evalnode(node: ParseNode): ParseNode {
    if (this.erred) return this.erred;
    const n: any = node;
    // deno-fmt-ignore
    switch (node.type) {
      case NT.real: return this.real(n);
      case NT.frac: return this.frac(n);
      case NT.variable: return this.variable(n);
      case NT.binex: return this.binex(n);
      case NT.call: return this.call(n);
      case NT.tuple: return this.tuple(n);
      case NT.equation: return this.equation(n);
			case NT.algex: return this.algex(n);
      case NT.error: return this.error(n);
    }
  }
  algex(node: AlgebraicExpression): ParseNode {
    const args = node.args.map((p) => this.evalnode(p));
    const out: ParseNode[] = [];
    args.forEach((p) => {
      if (isAlgex(p) && p.op === node.op) {
        p.args.forEach((n) => out.push(n));
      } else out.push(p);
    });
    return algex(node.op, out);
  }
  equation(node: Equation): ParseNode {
    return node;
  }
  error(node: Erratum) {
    this.erred = node;
    return node;
  }
  real(node: Real): ParseNode {
    if (this.erred) return this.erred;
    return node;
  }
  frac(node: Fraction): ParseNode {
    if (this.erred) return this.erred;
    return node;
  }
  variable(node: Variable): ParseNode {
    if (this.erred) return this.erred;
    const name = node.n;
    if (this.env[name] !== undefined) {
      return this.env[name];
    } else return node;
  }
  binex(node: BinaryExpression): ParseNode {
    if (this.erred) return this.erred;
    const left = this.evalnode(node.left);
    const right = this.evalnode(node.right);
    if (isNumeric(left) && isNumeric(right)) {
      const a = left.n;
      const b = right.n;
      switch (node.op) {
        case "+":
          return add(left, right);
        case "-":
          return sub(left, right);
        case "*":
          return mul(left, right);
        case "rem":
          return (isFrac(left) || isFrac(right))
            ? real(0)
            : real(((a % b) + a) % b);
        case "/":
          return div(left, right);
        case "^":
          return pow(left, right);
      }
    }
    return this.algex(algex(node.op, [left, right]));
  }
  call(node: CallExpression): ParseNode {
    if (this.erred) return this.erred;
    const args = node.args.ns.map((p) => this.evalnode(p));
    const fn = this.evalnode(node.caller);
    return node;
  }
  tuple(node: Tuple): Tuple {
    return tuple(node.ns.map((n) => this.evalnode(n)));
  }
}

const expression = (expr: string) => (
  new Evaluator(expr)
);

// const e = `(w + x) - (y + z)`;
// const r = expression(e).evaluate();
// const r = expr.parse(e);
// const r = expr.parse("y(3 + 5)");
// console.log(r);
