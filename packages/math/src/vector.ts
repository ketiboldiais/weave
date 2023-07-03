// @ts-nocheck

/**
 * Converts the provided number into a pair of integers (N,D),
 * where `N` is the numerator and `D` is the
 * denominator.
 */
export function toFrac(numberValue: number | Real | Fraction) {
  if (typeof numberValue !== "number") {
    if (isReal(numberValue)) {
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
  some,
  thunk,
} from "@weave/reed";

export interface Handler<T> {
  real(node: Real): T;
  frac(node: Fraction): T;
  variable(node: Variable): T;
  binex(node: BinaryExpression): T;
  unex(node: UnaryExpression): T;
  algex(node: AlgebraicExpression): T;
  call(node: CallExpression): T;
  tuple(node: Tuple): T;
  error(node: Erratum): T;
  relation(node: Relation): T;
}

export enum NT {
  real,
  frac,
  variable,
  binex,
  unex,
  call,
  tuple,
  error,
  relation,
  algex,
}

type NodeParser = P<ParseNode>;

type ParseNode = { type: NT };
// deno-fmt-ignore
const nodeGuard = <N extends ParseNode>(
  type: NT,
) => (
node: (ParseNode|null)
): node is N => (node !== null && node.type === type);

type Erratum = { type: NT.error; error: string };
const err = (error: string): Erratum => ({
  error,
  type: NT.error,
});
const isErr = nodeGuard<Erratum>(NT.error);

type Real = { n: number; type: NT.real };

const int = (x: number | string): Real => ({
  n: typeof x === "string" ? Number.parseInt(x) : x,
  type: NT.real,
});

const real = (x: number | string): Real => ({
  n: typeof x === "string" ? Number.parseFloat(x) : x,
  type: NT.real,
});
const isReal = nodeGuard<Real>(NT.real);

type Fraction = { n: number; d: number; type: NT.frac };
const frac = ([n, d]: [number, number]): Fraction => ({
  n,
  d,
  type: NT.frac,
});
const isFrac = nodeGuard<Fraction>(NT.frac);

type Numeric = Real | Fraction;

const isNumeric = (node: ParseNode): node is Real | Fraction => (
  node.type === NT.real || node.type === NT.frac
);

type Atomic = Numeric | Variable;
const isAtomic = (node: ParseNode): node is Atomic => (
  isNumeric(node) || isVar(node)
);

type BinaryExpression<Left = ParseNode, Right = ParseNode> = {
  op: string;
  left: Left;
  right: Right;
  type: NT.binex;
};
const binex = (
  [left, op, right]: [ParseNode, string, ParseNode],
): BinaryExpression => ({
  left,
  op,
  right,
  type: NT.binex,
});
const isBinex = nodeGuard<BinaryExpression>(NT.binex);

type UnaryExpression = {
  op: string;
  arg: ParseNode;
  type: NT.unex;
};
const unex = ([op, arg]: [string, ParseNode]): UnaryExpression => ({
  op,
  arg,
  type: NT.unex,
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
/**
 * Type guard: Returns true if the given node is an
 * algebraic expression, false otherwise.
 */
const isAlgex = nodeGuard<AlgebraicExpression>(NT.algex);

type CallExpression = {
  type: NT.call;
  caller: string;
  args: ParseNode[];
};
const call = ([caller, args]: [string, ParseNode[]]): CallExpression => ({
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
const isVar = nodeGuard<Variable>(NT.variable);

type Relation = {
  type: NT.relation;
  lhs: ParseNode;
  rhs: ParseNode;
  op: string;
};

type RationalArithmetic = BinaryExpression<Fraction, Fraction>;
const isRationalArithmetic = (node: ParseNode): node is RationalArithmetic => (
  isBinex(node) && isFrac(node.left) && isFrac(node.right)
);

type RealArithmetic = BinaryExpression<Real, Real>;
const isArithmeticBinex = (node: ParseNode): node is RealArithmetic => (
  isBinex(node) && isReal(node.left) && isReal(node.right)
);

/**
 * Returns a new equation node.
 */
const relation = (
  [lhs, op, rhs]: [ParseNode, string, ParseNode],
): Relation => ({
  lhs,
  op,
  rhs,
  type: NT.relation,
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
/**
 * Parses a positive integer.
 */
const posint = regex(POSITIVE_INTEGER).map(int);

/**
 * Parses a natural number.
 */
const natural = regex(NATURAL).map(int);

/**
 * Parses an integer.
 */
const integer = regex(INTEGER).map(int);

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
const ufloat = regex(POSITIVE_FLOAT).map(real);

/**
 * Parses a floating point number (possibly
 * signed).
 */
const float = list([maybe(addOp), ufloat]).map(([s, { n }]) => {
  const res = Number.parseFloat(`${s}${n}`);
  return (res === 0) ? int(0) : (Number.isInteger(res) ? int(res) : real(res));
});

const fraction = list([integer, slash, integer]).map(([n, _, d]) =>
  frac([n.n, d.n])
);
const digitalNumber = choice([float, integer]);
const numval = choice([fraction, float, integer, pi, euler]);
const varname = regex(LETTER).map(varx);
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
const expr = (input: string) => {
  const parendListOf = <T extends ParseNode>(
    nodeParser: P<T>,
  ) => parend(commaSeparated(nodeParser));
  const expression = thunk(() => sumExpr);

  const sumExpr = thunk(() => list([mulExpr, many(list([addOp, mulExpr]))]))

  return expression.parse(input).result.unwrap(err(`Parser failure`));
};

type NameRecord = Record<string, ParseNode>;

class Stringifier implements Handler<string> {
  stringify(node: ParseNode) {
    if (isErr(node)) return node.error;
    const n: any = node;
    switch (node.type) {
      case NT.real:
        return this.real(n);
      case NT.frac:
        return this.frac(n);
      case NT.variable:
        return this.variable(n);
      case NT.binex:
        return this.binex(n);
      case NT.unex:
        return this.unex(n);
      case NT.call:
        return this.call(n);
      case NT.tuple:
        return this.tuple(n);
      case NT.error:
        return this.error(n);
      case NT.relation:
        return this.relation(n);
      case NT.algex:
        return this.algex(n);
    }
  }
  real(node: Real): string {
    return `${node.n}`;
  }
  frac(node: Fraction): string {
    if (node.d === 1) return `${node.n}`;
    return `${node.n}/${node.d}`;
  }
  variable(node: Variable): string {
    return node.n;
  }
  binex(node: BinaryExpression): string {
    const L = node.left;
    const R = node.right;
    const left = this.stringify(L);
    const right = this.stringify(R);
    if (node.op === "*") {
      if (isVar(L) && isReal(R)) {
        return `${R.n}${L.n}`;
      }
      if (isVar(R) && isReal(L)) {
        return `${L.n}${R.n}`;
      }
      if (isBinex(L) && isBinex(R)) {
        return `(${left})(${right})`;
      }
    }
    const op = node.op;
    if (op === "^") {
      return `${left}^(${right})`;
    }
    return `${left} ${op} ${right}`;
  }
  unex(node: UnaryExpression): string {
    const arg = this.stringify(node.arg);
    const op = `${node.op}`;
    return `${op}${arg}`;
  }
  algex(node: AlgebraicExpression): string {
    const nodes = node.args.map((p) => this.stringify(p));
    return nodes.join(` ${node.op} `);
  }
  call(node: CallExpression): string {
    const f = node.caller;
    const args = node.args.map((p) => this.stringify(p)).join(",");
    return `${f}(${args})`;
  }
  tuple(node: Tuple): string {
    const es = node.ns.map((e) => this.stringify(e)).join(",");
    return `(${es})`;
  }
  error(node: Erratum): string {
    return node.error;
  }
  relation(node: Relation): string {
    const left = this.stringify(node.lhs);
    const right = this.stringify(node.rhs);
    return `${left} ${node.op} ${right}`;
  }
}

class Reducer implements Handler<ParseNode> {
  env: NameRecord;
  erred: null | Erratum = null;
  stringifier: Stringifier;
  constructor() {
    this.env = {
      pi: real(Math.PI),
      e: real(Math.PI),
    };
    this.stringifier = new Stringifier();
  }
  toString(node: ParseNode) {
    return this.stringifier.stringify(node);
  }
  evalnode(node: ParseNode): ParseNode {
    if (isErr(node)) return node;
    const n: any = node;
    // deno-fmt-ignore
    switch (node.type) {
      case NT.real: return this.real(n);
      case NT.frac: return this.frac(n);
      case NT.variable: return this.variable(n);
      case NT.binex: return this.binex(n);
      case NT.call: return this.call(n);
      case NT.tuple: return this.tuple(n);
      case NT.relation: return this.relation(n);
			case NT.algex: return this.algex(n);
      case NT.error: return this.error(n);
			case NT.unex: return this.unex(n);
    }
  }
  unex(node: UnaryExpression): ParseNode {
    return this.evalnode(node.arg);
  }
  algex(node: AlgebraicExpression): ParseNode {
    const args = node.args.map((p) => this.evalnode(p));
    if (args.length === 2) {
      return binex([args[0], node.op, args[1]]);
    }
    const out: ParseNode[] = [];
    args.forEach((p) => {
      if (isAlgex(p) && p.op === node.op) {
        p.args.forEach((n) => out.push(n));
      } else out.push(p);
    });
    const sortedNodes = this.sortNodes(out);
    const nodeStrings = sortedNodes.map((n) => this.toString(n));
    const fix: ParseNode[] = [];
    const isMul = node.op === "*";
    for (let i = 0; i < nodeStrings.length; i++) {
      const s = nodeStrings[i];
      if (isMul && s === "1") {
        continue;
      }
      const nxt = nodeStrings[i + 1];
      if ((nxt !== undefined) && (s === nxt)) {
        const two = real(2);
        const factor = sortedNodes[i];
        if (isMul) {
          fix.push(binex([factor, "^", two]));
        } else fix.push(binex([two, "*", factor]));
        i++;
        continue;
      }
      fix.push(sortedNodes[i]);
    }
    return algex(node.op, fix);
  }
  sortNodes(nodes: ParseNode[]) {
    return [...nodes].sort((a, b) =>
      this.toString(a) < this.toString(b) ? -1 : 1
    );
  }
  relation(node: Relation): ParseNode {
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
    if (node.d === 1) return real(node.n);
    if (node.d === node.n) return real(node.d / node.n);
    return node;
  }
  variable(node: Variable): ParseNode {
    if (this.erred) return this.erred;
    const name = node.n;
    if (this.env[name] !== undefined) {
      return this.env[name];
    } else return node;
  }
  areEqual(left: ParseNode, right: ParseNode) {
    const l = this.toString(left);
    const r = this.toString(right);
    return l === r;
  }
  rationalArithmetic(node: RationalArithmetic) {
    const left = node.left;
    const right = node.right;
    switch (node.op) {
      case "*":
        return simplify(frac([
          left.n * right.n,
          left.d * right.d,
        ]));
      case "/":
        return simplify(frac([
          left.n * right.d,
          left.d * right.n,
        ]));
      case "+":
        return simplify(frac([
          left.n * right.d + right.n * left.d,
          left.d * right.d,
        ]));
      case "-":
        return simplify(frac([
          left.n * right.d - right.n * left.d,
          left.d * right.d,
        ]));
    }
    return node;
  }
  realArithmetic(node: RealArithmetic) {
    const left = node.left.n;
    const right = node.right.n;
    switch (node.op) {
      case "+":
        return real(left + right);
      case "-":
        return real(left - right);
      case "*":
        return real(left * right);
      case "/":
        return simplify(frac([left, right]));
      case "rem":
        return real(((left % right) + left) % right);
      case "^":
        return real(left ** right);
    }
    return node;
  }

  binex(node: BinaryExpression): ParseNode {
    if (this.erred) return this.erred;
    let left = this.evalnode(node.left);
    let right = this.evalnode(node.right);
    let out: ParseNode = binex([left, node.op, right]);
    let op = node.op;
    if (isArithmeticBinex(out)) {
      return this.realArithmetic(out);
    }
    if (isRationalArithmetic(out)) {
      return this.rationalArithmetic(out);
    }
    if (isNumeric(left) && isNumeric(right)) {
      return this.rationalArithmetic(binex([
        toFrac(left),
        op,
        toFrac(right),
      ]) as RationalArithmetic);
    }
    return out;
  }
  call(node: CallExpression): ParseNode {
    return node;
  }
  tuple(node: Tuple): Tuple {
    return tuple(node.ns.map((n) => this.evalnode(n)));
  }
}

function reduce(expression: ParseNode) {
  const reducer = new Reducer();
  return reducer.evalnode(expression);
}
function stringify(expression: ParseNode) {
  const stringifier = new Stringifier();
  return stringifier.stringify(expression);
}

const e = expr(`6 * 3 - 1`);
console.log(e);
// const ex = reduce(e);
// console.log(ex);
// const r = stringify(ex);
// console.log(r);
