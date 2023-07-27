import { floor } from "../..";
import { abs } from "../util";



abstract class Expression {
  parenLevel: number = 0;
  parenthesize() {
    this.parenLevel++;
    return this;
  }
  abstract isUndefined(): this is Undefined;
  abstract isAlgebraic(): this is AlgebraicExpression;
  abstract isInt(): this is Int;
  abstract isSym(): this is Sym;
  abstract isReal(): this is Real;
  abstract isSum(): this is Sum;
  abstract isProduct(): this is Product;
  abstract isDifference(): this is Difference;
}
enum atom {
  sym = "sym",
  int = "int",
  real = "real",
  undefined = "UNDEFINED",
}

abstract class Atom extends Expression {
  op: atom;
  constructor(op: atom) {
    super();
    this.op = op;
  }
  isReal(): this is Real {
    return this.op === atom.real;
  }
  isUndefined(): this is Undefined {
    return (this.op === atom.undefined);
  }
  isInt(): this is Int {
    return this.op === atom.int;
  }
  isSym(): this is Sym<string> {
    return this.op === atom.sym;
  }
  isSum(): this is Sum {
    return false;
  }
  isDifference(): this is Difference {
    return false;
  }
  isProduct(): this is Product {
    return false;
  }
}

class Int extends Atom {
  n: number;
  constructor(n: number) {
    super(atom.int);
    this.n = n;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return true;
  }
  abs() {
    return int(abs(this.n));
  }
}

function int(n: number) {
  return new Int(floor(n));
}

class Sym<X extends string = string> extends Atom {
  s: X;
  constructor(sym: X) {
    super(sym === atom.undefined ? atom.undefined : atom.sym);
    this.s = sym;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return true;
  }
}

function sym(s: string) {
  return new Sym(s);
}

type Undefined = Sym<atom.undefined>;

function dne(): Undefined {
  return new Sym(atom.undefined);
}

class Real extends Atom {
  r: number;
  constructor(r: number) {
    super(atom.real);
    this.r = r;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}
function real(r: number) {
  return new Real(r);
}

type AlgebraicExpression =
  | Int
  | Sym
  | AlgebraicOp;

abstract class Compound extends Expression {
  op: string;
  operands: Expression[];
  constructor(op: string, operands: Expression[]) {
    super();
    this.op = op;
    this.operands = operands;
  }
  isProduct(): this is Product {
    return this.op === core.product;
  }
  isDifference(): this is Difference {
    return this.op === core.difference;
  }
  isSum(): this is Sum {
    return this.op === core.sum;
  }
  isReal(): this is Real {
    return false;
  }
  isSym(): this is Sym<string> {
    return false;
  }
  isInt(): this is Int {
    return false;
  }
  isUndefined(): this is Undefined {
    for (let i = 0; i < this.operands.length; i++) {
      if (this.operands[i].isUndefined()) return true;
    }
    return false;
  }
}

enum core {
  sum = "+",
  product = "*",
  power = "^",
  difference = "-",
  quotient = "/",
  factorial = "!",
  fraction = "//",
}

class AlgebraicOp extends Compound {
  op: core;
  operands: AlgebraicExpression[];
  constructor(op: core, operands: AlgebraicExpression[]) {
    super(op, operands);
    this.op = op;
    this.operands = operands;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return true;
  }
}

class Sum extends AlgebraicOp {
  readonly op: core.sum = core.sum;
  constructor(operands: AlgebraicExpression[]) {
    super(core.sum, operands);
  }
}

/**
 * Returns a new sum.
 */
function sum(operands: AlgebraicExpression[]) {
  return new Sum(operands);
}

class Power extends AlgebraicOp {
  readonly op: core.power = core.power;
  operands: [AlgebraicExpression, AlgebraicExpression];
  constructor(base: AlgebraicExpression, exponent: AlgebraicExpression) {
    super(core.power, [base, exponent]);
    this.operands = [base, exponent];
  }
}

class Product extends AlgebraicOp {
  readonly op: core.product = core.product;
  operands: AlgebraicExpression[];
  constructor(operands: AlgebraicExpression[]) {
    super(core.product, operands);
    this.operands = operands;
  }
}

function product(operands: AlgebraicExpression[]) {
  return new Product(operands);
}

class Difference extends AlgebraicOp {
  readonly op: core.difference = core.difference;
  operands: [AlgebraicExpression] | [AlgebraicExpression, AlgebraicExpression];
  constructor(
    operands: [AlgebraicExpression] | [
      AlgebraicExpression,
      AlgebraicExpression,
    ],
  ) {
    super(core.difference, operands);
    this.operands = operands;
  }
}

/**
 * Returns a new difference.
 */
function difference(
  operands: [AlgebraicExpression] | [AlgebraicExpression, AlgebraicExpression],
) {
  return new Difference(operands);
}

class Quotient extends AlgebraicOp {
  op: core.quotient = core.quotient;
  operands: [AlgebraicExpression, AlgebraicExpression];
  constructor(operands: [AlgebraicExpression, AlgebraicExpression]) {
    super(core.quotient, operands);
    this.operands = operands;
  }
}

function quotient(dividend: AlgebraicExpression, divisor: AlgebraicExpression) {
  return new Quotient([dividend, divisor]);
}

class Factorial extends AlgebraicOp {
  op: core.factorial = core.factorial;
  operands: [AlgebraicExpression];
  constructor(operands: [AlgebraicExpression]) {
    super(core.factorial, operands);
    this.operands = operands;
  }
}

class Fraction extends AlgebraicOp {
  op: core.fraction = core.fraction;
  operands: [Int, Int];
  constructor(n: Int, d: Int) {
    super(core.fraction, [n, d]);
    this.operands = [n, d];
  }
}

function frac(n: Int | number, d: Int | number) {
  const N = (typeof n === "number") ? int(n) : n;
  const D = (typeof d === "number") ? int(d) : d;
  return new Fraction(N, D.abs());
}

class AlgebraicFun extends Compound {
  op: string;
  args: AlgebraicExpression[];
  constructor(op: string, args: AlgebraicExpression[]) {
    super(op, args);
    this.op = op;
    this.args = args;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return true;
  }
}

class SetOp extends Compound {
  op: "set" = "set";
  operands: Expression[];
  constructor(operands: Expression[]) {
    super("set", operands);
    this.operands = operands;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}
class ListOp extends Compound {
  op: "list" = "list";
  operands: Expression[];
  constructor(operands: Expression[]) {
    super("list", operands);
    this.operands = operands;
  }
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}

class LogicalOp extends Compound {
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}

class RelationOp extends Compound {
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}

class PlainFunction extends Compound {
  isAlgebraic(): this is AlgebraicExpression {
    return false;
  }
}
