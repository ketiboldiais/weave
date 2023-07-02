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
export const toFrac = (numberValue: number) => {
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
  return [h, k];
};

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
  thunk,
} from "@weave/reed";

export interface Handler<T> {
  real(node: NumNode): T;
  frac(node: FracNode): T;
  variable(node: VariableNode): T;
  binex(node: BinexNode): T;
  call(node: CallNode): T;
  tuple(node: TupleNode): T;
  error(node: ErrorNode): T;
  equation(node: EquationNode): T;
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
}
type NodeParser = P<ParseNode>;

type ParseNode = { type: NT };
type NumNode = { n: number; type: NT.real };
type ErrorNode = { type: NT.error; error: string };
type FracNode = { n: number; d: number; type: NT.frac };
type BinexNode = {
  op: string;
  left: ParseNode;
  right: ParseNode;
  type: NT.binex;
};
type CallNode = {
  type: NT.call;
  caller: VariableNode;
  args: TupleNode;
};
type TupleNode = { type: NT.tuple; ns: ParseNode[] };
type VariableNode = { n: string; type: NT.variable };
type EquationNode = {
  type: NT.equation;
  lhs: ParseNode;
  rhs: ParseNode;
};

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
const fname = regex(NATIVE_FN);
const lparen = lit("(");
const rparen = lit(")");
const parend = amid(lparen, rparen);
const commaSeparated = sepby(comma);

const err = (error: string): ErrorNode => ({
  error,
  type: NT.error,
});

// deno-fmt-ignore
const nodeGuard = <N extends ParseNode>(
  type: NT,
) => (
node: ParseNode
): node is N => (node.type === type);

const int = (x: number | string): NumNode => ({
  n: typeof x === "string" ? Number.parseInt(x) : x,
  type: NT.real,
});

const real = (x: number | string): NumNode => ({
  n: typeof x === "string" ? Number.parseFloat(x) : x,
  type: NT.real,
});

const isNumber = nodeGuard<NumNode>(NT.real);

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

const nconst = (n: "pi" | "e"): VariableNode => ({
  n,
  type: NT.variable,
});

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

const frac = ([n, d]: [number, number]): FracNode => ({
  n,
  d,
  type: NT.frac,
});

const fraction = list([integer, slash, integer]).map(([n, _, d]) =>
  frac([n.n, d.n])
);
const isFrac = nodeGuard<FracNode>(NT.frac);

const numval = choice([fraction, float, integer, pi, euler]);

const varx = (n: string): VariableNode => ({
  n,
  type: NT.variable,
});

const varname = regex(LETTER).map(varx);
const isVariable = nodeGuard<VariableNode>(NT.variable);

const binex = (left: ParseNode, op: string, right: ParseNode): BinexNode => ({
  left,
  op,
  right,
  type: NT.binex,
});
const isBinex = nodeGuard<BinexNode>(NT.binex);

type FnCall = (args: ParseNode[], env: NameRecord) => ParseNode;

const call = (
  caller: VariableNode,
  args: TupleNode,
): CallNode => ({
  caller,
  args,
  type: NT.call,
});
const isCall = nodeGuard<CallNode>(NT.call);

const tuple = (ns: ParseNode[]): TupleNode => ({
  type: NT.tuple,
  ns,
});
const tupleOf = (
  nodeParser: P<ParseNode>,
) => parend(commaSeparated(nodeParser)).map(tuple);

const isTuple = nodeGuard<TupleNode>(NT.tuple);

const floats = choice([float, integer, pi, euler]);

const implicitMulExpr = list([floats, varname]).map(
  ([l, r]) => binex(l, "*", r),
);

const atom: NodeParser = choice([implicitMulExpr, numval, varname]);

const expr: NodeParser = thunk(() => choice([sumExpr, term]));

const term: NodeParser = thunk(() => choice([mulExpr, factor]));

const factor: NodeParser = thunk(() => choice([powExpr, power]));

const power: NodeParser = thunk(() => choice([fnCall, atom]));

const fnCall: NodeParser = thunk(() => choice([callExpr, parend(expr)]));

const callExpr = list([fname, tupleOf(expr)]).map(([name, args]) =>
  call(varx(name), args)
);

const powExpr = (list([atom, caretOp, expr])).map((
  [left, op, right],
) => (
  binex(left, op, right)
));

const mulExpr = (list([atom, mulOp, expr])).map((
  [left, op, right],
) => (
  binex(left, op, right)
)).or(
  list([floats, parend(expr)]).map(([l, r]) => binex(l, "*", r)),
);

const sumExpr = list([atom, addOp, expr]).map((
  [left, op, right],
) => (
  binex(left, op, right)
));

const eqn = (lhs: ParseNode, rhs: ParseNode): EquationNode => ({
  lhs,
  rhs,
  type: NT.equation,
});

const pEqn = list([expr, equal, expr]).map(([lhs, _, rhs]) => eqn(lhs, rhs));
const prog = choice([pEqn, expr]);

type NameRecord = Record<string, ParseNode>;
class Evaluator implements Handler<ParseNode> {
  env: NameRecord;
  private expression: string;
  erred: null | ErrorNode = null;
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
      case NT.error: return this.error(n);
    }
  }
  equation(node: EquationNode): ParseNode {
    return node;
  }
  error(node: ErrorNode) {
    this.erred = node;
    return node;
  }
  real(node: NumNode): ParseNode {
    if (this.erred) return this.erred;
    return node;
  }
  frac(node: FracNode): ParseNode {
    if (this.erred) return this.erred;
    return node;
  }
  variable(node: VariableNode): ParseNode {
    if (this.erred) return this.erred;
    const name = node.n;
    if (this.env[name] !== undefined) {
      return this.env[name];
    } else return node;
  }
  binex(node: BinexNode): ParseNode {
    if (this.erred) return this.erred;
    const left = this.evalnode(node.left);
    const right = this.evalnode(node.right);
    if (isNumber(left) && isNumber(right)) {
      const a = left.n;
      const b = right.n;
      // deno-fmt-ignore
      switch (node.op) {
        case "+": return real(a + b);
        case "-": return real(a - b);
        case "*": return real(a * b);
        case "rem": return real(((a % b) + a) % b);
        case "/": return real(a / b);
        case "^": return real(a ** b);
      }
    }
    return node;
  }
  call(node: CallNode): ParseNode {
    if (this.erred) return this.erred;
    const args = node.args.ns.map((p) => this.evalnode(p));
    const fn = this.evalnode(node.caller);
    return node;
  }
  tuple(node: TupleNode): TupleNode {
    return tuple(node.ns.map((n) => this.evalnode(n)));
  }
}

const expression = (expr: string) => (
  new Evaluator(expr)
);

const r = expression(`5 + 2`).evaluate();
console.log(r);
