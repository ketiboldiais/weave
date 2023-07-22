import { tt } from "./enums";
import { algebraError, Err } from "./err";
import {
  AlgebraicVisitor,
  AssignExpr,
  Binary,
  Expr,
  Float,
  FnCall,
  Group,
  Integer,
  Literal,
  LogicalExpr,
  MatrixExpr,
  NativeCall,
  NotExpr,
  RelationExpr,
  Variable,
  VectorExpr,
} from "./nodes.core";
import { algebra, imul, lexemes, symsplit, treeof } from "./parser";
import {
  abs,
  addF,
  divF,
  Fraction,
  isarray,
  isDigit,
  Left,
  left,
  mulF,
  print,
  Right,
  right,
  simplify,
} from "./util";

abstract class Expression {
  abstract get kind(): string;
  abstract get isUndefined(): boolean;
  abstract get base(): Expression;
  abstract get exponent(): Expression;
  abstract copy(): Expression;
  abstract term(): Expression[];
  abstract constant(): Expression;
  abstract get isConstant(): boolean;
  abstract equals(other: Expression): boolean;
  abstract operand(i: number): Expression;
  abstract lastOperand(): Expression;
  abstract get isFunction(): boolean;
  abstract toString(): string;
  abstract get opcount(): number;
  parenLevel: number = 0;
  tickparen() {
    this.parenLevel++;
    return this;
  }
}

class Int extends Expression {
  n: number;
  constructor(n: number) {
    super();
    this.n = n;
  }
  get opcount(): number {
    return 0;
  }
  toString(): string {
    return `${this.n}`;
  }
  get isFunction(): boolean {
    return false;
  }
  lastOperand(): Expression {
    return Undefined();
  }
  operand(i: number): Expression {
    return Undefined();
  }
  equals(other: Expression): boolean {
    if (isint(other)) {
      return this.n === other.n;
    } else if (isfrac(other)) {
      const a = Fraction.from([this.n, 1]);
      const b = Fraction.from([other.n, other.d]);
      return a.equals(b);
    } else {
      return false;
    }
  }

  constant(): Expression {
    return Undefined();
  }
  lessThan(other: Expression): boolean {
    if (isint(other)) {
      return this.n < other.n;
    } else if (isfrac(other)) {
      const a = Fraction.from([this.n, 1]);
      const b = Fraction.from([other.n, other.d]);
      return a.lt(b);
    } else {
      return true;
    }
  }
  get isConstant(): boolean {
    return true;
  }
  term(): Expression[] {
    return [Undefined()];
  }
  get exponent(): Expression {
    return Undefined();
  }
  copy(): Expression {
    return int(this.n);
  }
  get base(): Expression {
    return Undefined();
  }

  mul(other: Numeric): Numeric {
    if (isint(other)) {
      return int(this.n * other.n);
    } else {
      const [a, b] = mulF([this.n, 1], [other.n, other.d]);
      if (b === 1) return int(a);
      if (a === b) return int(1);
      return ratio([a, b]);
    }
  }
  div(other: Numeric) {
    if (isint(other)) {
      if (other.isZero) return Undefined();
      if (other.isOne) return int(this.n);
      const out = ratio([this.n, other.n]);
      if (out.d === 1) return int(this.n);
      if (out.n === out.d) return int(1);
      return out;
    } else {
      const [a, b] = divF([this.n, 1], [other.n, other.d]);
      if (b === 1) return int(a);
      if (a === b) return int(1);
      return ratio([a, b]);
    }
  }
  add(other: Numeric): Numeric {
    if (isint(other)) {
      return new Int(this.n + other.n);
    } else {
      const out = ratio(addF([this.n, this.d], [other.n, other.d]));
      if (out.d === 1) return int(out.n);
      if (out.n === out.d) return int(1);
      return out;
    }
  }
  get isOne() {
    return this.n === 1;
  }
  get isPositive() {
    return this.n > 0;
  }
  get isNegative() {
    return this.n < 0;
  }
  get isZero() {
    return this.n === 0;
  }
  get isUndefined(): boolean {
    return false;
  }
  get kind(): "int" {
    return "int";
  }
  get d() {
    return 1;
  }
}
const int = (n: number) => (
  new Int(n)
);
const isint = (e: E): e is Int => (
  e.kind === "int"
);
type Numeric = Rational | Int;

class Rational extends Expression {
  n: number;
  d: number;
  constructor(n: number, d: number) {
    super();
    this.n = n;
    this.d = abs(d);
  }
  get opcount(): number {
    return 0;
  }
  lastOperand(): Expression {
    return Undefined();
  }
  toString(): string {
    return `${this.n}/${this.d}`;
  }
  get isFunction(): boolean {
    return false;
  }
  operand(i: number): Expression {
    return Undefined();
  }
  equals(other: Expression): boolean {
    if (isnum(other)) {
      const a = Fraction.from([this.n, this.d]);
      const b = Fraction.from([other.n, other.d]);
      return a.equals(b);
    } else {
      return false;
    }
  }
  lessThan(other: Expression) {
    if (isnum(other)) {
      const a = Fraction.from([this.n, this.d]);
      const b = Fraction.from([other.n, other.d]);
      return a.lt(b);
    } else {
      return true;
    }
  }
  constant(): Expression {
    return Undefined();
  }
  get isConstant(): boolean {
    return true;
  }
  term(): Expression[] {
    return [Undefined()];
  }
  get exponent(): Expression {
    return Undefined();
  }
  copy(): Expression {
    return ratio([this.n, this.d]);
  }
  get base(): Expression {
    return Undefined();
  }
  mul(other: Numeric) {
    const [a, b] = mulF([this.n, this.d], [other.n, other.d]);
    if (b === 1) return int(a);
    if (a === b) return int(1);
    return ratio([a, b]);
  }
  div(other: Numeric) {
    const [a, b] = divF([this.n, this.d], [other.n, other.d]);
    if (b === 1) return int(a);
    if (a === b) return int(1);
    return ratio([a, b]);
  }
  add(other: Numeric) {
    const [a, b] = addF([this.n, this.d], [other.n, other.d]);
    if (b === 1) return int(a);
    if (a === b) return int(1);
    return ratio([a, b]);
  }
  get isOne() {
    return this.n === this.d;
  }
  get isNegative() {
    return this.n < 0;
  }
  get isPositive() {
    return this.n > 0;
  }
  get isZero() {
    return this.n === 0;
  }
  get isUndefined(): boolean {
    return false;
  }
  get kind(): "frac" {
    return "frac";
  }
}
const isfrac = (n: E): n is Rational => (
  n.kind === "frac"
);
const ratio = ([n, d]: [number, number]) => {
  const [a, b] = simplify([n, d]);
  return new Rational(a, b);
};

class Sym extends Expression {
  n: string;
  constructor(n: string) {
    super();
    this.n = n;
  }
  get opcount(): number {
    return 0;
  }
  lastOperand(): Expression {
    return Undefined();
  }
  toString(): string {
    return this.n;
  }
  get isFunction(): boolean {
    return false;
  }
  operand(i: number): Expression {
    return Undefined();
  }
  equals(other: Expression): boolean {
    if (issym(other)) {
      return this.n === other.n;
    } else {
      return false;
    }
  }
  constant(): Expression {
    return int(1);
  }

  get isConstant(): boolean {
    return false;
  }
  term(): Expression[] {
    return [sym(this.n)];
  }
  get exponent(): Expression {
    return sym(this.n);
  }
  copy(): Expression {
    return sym(this.n);
  }
  get base(): Expression {
    return sym(this.n);
  }
  get isUndefined(): boolean {
    return this.n === "DNE";
  }
  get kind(): "sym" {
    return "sym";
  }
}
const issym = (n: E): n is Sym => (
  n.kind === "sym"
);
const sym = (s: string) => (
  new Sym(s)
);
const Undefined = () => (
  new Sym("DNE")
);

class Compound extends Expression {
  kind: string;
  args: Expression[];
  get base(): Expression {
    if (this.kind === "^") {
      return this.operand(1);
    } else {
      return this.copy();
    }
  }
  get opcount(): number {
    return this.args.length;
  }
  lastOperand() {
    return this.args[this.args.length - 1];
  }
  toString(): string {
    const args = this.args.map((x) => x.toString());
    if (this.isFunction) {
      const f = this.kind;
      return `${f}(${args.join(",")})`;
    } else {
      const out = args.join(this.kind);
      if (this.parenLevel !== 0) {
        return `(${out})`;
      } else {
        return out;
      }
    }
  }
  get isFunction(): boolean {
    return (
      this.kind !== "+" &&
      this.kind !== "*" &&
      this.kind !== "^" &&
      this.kind !== "!"
    );
  }
  equals(other: Expression): boolean {
    if (!(other instanceof Compound)) return false;
    if (this.kind !== other.kind) return false;
    for (let i = 1; i <= this.args.length; i++) {
      const a = this.operand(i);
      const b = other.operand(i);
      if (!a.equals(b)) return false;
    }
    return true;
  }
  constant(): Expression {
    if (this.kind === "*" && this.operand(1).isConstant) {
      return this.operand(1);
    } else {
      return int(1);
    }
  }

  get isConstant(): boolean {
    return false;
  }
  term(): Expression[] {
    if (this.kind === "*" && this.operand(1).isConstant) {
      return this.args.slice(1);
    } else {
      return [this.copy()];
    }
  }
  get exponent(): Expression {
    if (this.kind === "^") {
      return this.operand(2);
    } else {
      return int(1);
    }
  }
  operand(i: number) {
    const out = this.args[i - 1];
    if (out === undefined) return Undefined();
    return out;
  }
  copy(): Expression {
    const args = this.args.map((c) => c.copy());
    return new Compound(this.kind, args);
  }
  constructor(kind: string, args: Expression[]) {
    super();
    this.kind = kind;
    this.args = args;
  }
  get isUndefined(): boolean {
    return false;
  }
}

type Operands = (Expression | string | number | [number, number])[];
const cast = (args: Operands) => {
  const operands: Expression[] = args.map((x) => {
    if (typeof x === "string") return sym(x);
    if (typeof x === "number") return int(x);
    if (isarray(x)) return ratio([x[0], x[1]]);
    return x;
  });
  return operands;
};
const exp = (op: string, args: Operands) => {
  return new Compound(op, cast(args));
};
type E = Expression;
const sum = (args: Operands) => {
  const xs = cast(args);
  return exp("+", xs);
};

/**
 * Returns a new factorial expression.
 */
const factorial = (arg: E) => (
  new Compound("!", [arg])
);

/**
 * Returns a new product expression.
 */
const product = (args: Operands) => {
  const xs = cast(args);
  return exp("*", xs);
};

/**
 * Returns true if the given expression
 * is a product expression.
 */
const isprod = (e: E): e is Compound => (
  e.kind === "*"
);

/**
 * Returns a new power expression.
 */
const power = (args: Operands) => {
  return exp("^", args);
};

/**
 * Returns true if the given expression
 * is a power expression.
 */
const ispow = (expr: Expression): expr is Compound => (
  expr.kind === "^"
);

/**
 * Returns a new quotient expression.
 */
const quotient = (args: Operands) => {
  return exp("/", args);
};

/**
 * Returns true if the given expression
 * is a quotient expression.
 */
const isquot = (n: Expression): n is Compound => (
  n.kind === "/"
);

/**
 * Returns a new difference expression.
 */
const diff = (args: Operands) => {
  return exp("-", args);
};

/**
 * Returns true if the given expression is a
 * difference expression.
 */
const isdiff = (n: Expression): n is Compound => (
  n.kind === "-"
);

/**
 * Returns true if the given expression is a
 * numeric (an integer or a rational).
 */
const isnum = (e: E): e is Rational | Int => (
  isfrac(e) || isint(e)
);

/**
 * Returns true if the given expression is a
 * sum expression.
 */
const issum = (e: E): e is Compound => (
  e.kind === "+"
);

/**
 * Concatenates two argument lists.
 */
const concat = (a: E[], b: E[]): E[] => {
  return [...a, ...b];
};

/**
 * Returns true if the given expression
 * is a factorial expression.
 */
const isfactorial = (e: E): e is Compound => (
  e.kind === "!"
);

/**
 * Returns true if expression `e1` precedes
 * expression `e2`, and false otherwise, following
 * Weave’s order relation.
 */
export const prec = (e1: E, e2: E) => {
  // @ts-ignore
  const O1 = (u: Numeric, v: Numeric) => (u.lessThan(v));

  // @ts-ignore
  const O2 = (u: Sym, v: Sym) => u.n < v.n;

  // u and v must be both products or operands.
  // @ts-ignore
  const O3 = (u: Compound, v: Compound) => {
    if (!u.lastOperand().equals(v.lastOperand())) {
      return f(u.lastOperand(), v.lastOperand());
    }
    const m = u.args.length;
    const n = v.args.length;
    const k = Math.min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k; j++) {
        const o1 = u.operand(m - j);
        const o2 = v.operand(n - j);
        if (!o1.equals(o2)) {
          return f(o1, o2);
        }
      }
    }
    return m < n;
  };
  // u and v are both powers
  // @ts-ignore
  const O4 = (u: Compound, v: Compound) => {
    if (!u.base.equals(v.base)) {
      return f(u.base, v.base);
    } else {
      return f(u.exponent, v.exponent);
    }
  };
  // u and v are factorials
  // @ts-ignore
  const O5 = (u: Compound, v: Compound) => {
    return f(u.operand(1), v.operand(1));
  };
  // u and v are functions
  // @ts-ignore
  const O6 = (u: Compound, v: Compound) => {
    if (u.kind !== v.kind) {
      return u.kind < v.kind;
    } else {
      if (!u.operand(1).equals(v.operand(1))) {
        return f(u.operand(1), v.operand(1));
      }
    }
    const m = u.args.length;
    const n = v.args.length;
    const k = Math.min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k - 1; j++) {
        const o1 = u.operand(m - j);
        const o2 = v.operand(n - j);
        if (!o1.equals(o2)) {
          return f(o1, o2);
        }
      }
    }
    return m < n;
  };
  // @ts-ignore
  const O7 = (u: Int | Rational, v: E) => {
    return f(u, v);
  };
  // u is a product
  // @ts-ignore
  const O8 = (u: Compound, v: E) => {
    if (!u.equals(v)) {
      return f(u.lastOperand(), v);
    } else {
      return true;
    }
  };
  // @ts-ignore
  const O9 = (u: Compound, v: E) => {
    return f(u, power([v, int(1)]));
  };
  // @ts-ignore
  const O10 = (u: Compound, v: E) => {
    if (!u.equals(v)) {
      return f(u, sum([v]));
    } else {
      return true;
    }
  };
  // @ts-ignore
  const O11 = (u: Compound, v: Compound | Sym) => {
    if (u.operand(1).equals(v)) return false;
    else return f(u, factorial(v));
  };
  // @ts-ignore
  const O12 = (u: Compound, v: Sym) => {
    if (u.kind !== v.kind) {
      return false;
    } else {
      return f(sym(u.kind), v);
    }
  };
  // @ts-ignore
  const f = (u: E, v: E) => {
    if (isnum(u) && isnum(v)) {
      return O1(u, v);
    } else if (issym(u) && issym(v)) {
      return O2(u, v);
    } else if ((issum(u) && issum(v)) || (isprod(u) && isprod(v))) {
      return O3(u, v);
    } else if (ispow(u) && ispow(v)) {
      return O4(u, v);
    } else if (isfactorial(u) && isfactorial(v)) {
      return O5(u, v);
    } else if (u.isFunction && v.isFunction) {
      // @ts-ignore
      return O6(u, v);
    } else if (isnum(u)) {
      return O7(u, v);
    } else if (
      isprod(u) && (
        ispow(v) || issum(v) || isfactorial(v) || v.isFunction || issym(v)
      )
    ) {
      return O8(u, v);
    } else if (
      ispow(u) && (
        issum(v) ||
        isfactorial(v) ||
        v.isFunction ||
        issym(v)
      )
    ) {
      return O9(u, v);
    } else if (
      issum(u) && (
        isfactorial(v) ||
        v.isFunction ||
        issym(v)
      )
    ) {
      return O10(u, v);
    } else if (isfactorial(u) && (issym(v) || v.isFunction)) {
      // @ts-ignore
      return O11(u, v);
    } else if (u.isFunction && issym(v)) {
      // @ts-ignore
      return O12(u, v);
    } else {
      return !(f(u, v));
    }
  };
  return f(e1, e2) as any as boolean;
};

const multiply = (args: E[]) => {
  const ns: Numeric[] = [];
  const xs: E[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (isnum(a)) {
      ns.push(a);
    } else {
      xs.push(a);
    }
  }
  const N = ns.reduce((p, c) => p.mul(c), int(1));
  if (!N.isZero) {
    xs.push(N);
  }
  return xs;
};

const summate = (args: E[]) => {
  const ns: Numeric[] = [];
  const xs: E[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (isnum(a)) {
      ns.push(a);
    } else {
      xs.push(a);
    }
  }
  const N = ns.reduce((p, c) => p.add(c), int(0));
  if (!N.isZero) {
    xs.push(N);
  }
  return xs;
};

type Result = Left<Err> | Right<Expression>;

class Reducer implements AlgebraicVisitor<Result> {
  reduce(expr: Left<Err> | Right<Expr>): Left<Err> | Right<Expression> {
    if (expr.isLeft()) return expr;
    const out = this.ap(expr.unwrap());
    return out;
  }
  ap(node: Expr) {
    return node.map(this);
  }
  int(node: Integer): Result {
    return right(int(node.n));
  }
  float(node: Float): Result {
    return right(int(node.n));
  }
  symbol(node: Variable): Result {
    return right(sym(node.name.lex));
  }
  literal(node: Literal): Result {
    return this.croak(`Literal`);
  }
  binary(node: Binary): Result {
    const L = this.ap(node.left);
    if (L.isLeft()) return L;
    const R = this.ap(node.right);
    if (R.isLeft()) return R;
    const op = node.op;
    const out = L.chain((a) =>
      R.chain((b) => {
        if (op.is(tt.plus)) {
          if (isnum(a) && a.isZero) {
            return right(b);
          } else if (isnum(b) && b.isZero) {
            return right(a);
          } else if (isnum(a) && isnum(b)) {
            return right(a.add(b));
          } else if (issum(a) && issum(b)) {
            const ns = summate([...a.args, ...b.args]);
            if (ns.length === 0) return right(ns[0]);
            return right(sum(ns));
          } else if (issum(a)) {
            const ns = summate([...a.args, b]);
            if (ns.length === 1) return right(ns[0]);
            return right(sum(ns));
          } else if (issum(b)) {
            const ns = summate([a, ...b.args]);
            if (ns.length === 1) return right(ns[0]);
            return right(sum(ns));
          } else {
            const ns = summate([a, b]);
            if (ns.length === 1) {
              return right(ns[0]);
            } else {
              return right(sum(ns));
            }
          }
        } else if (op.is(tt.star)) {
          if ((isnum(a) && a.isZero) || (isnum(b) && b.isZero)) {
            return right(int(0));
          } else if ((isnum(a) && a.isOne)) {
            return right(b);
          } else if ((isnum(b) && b.isOne)) {
            return right(a);
          } else if (isnum(a) && isnum(b)) {
            return right(a.mul(b));
          } else if (isprod(a) && isprod(b)) {
            const ns = multiply([...a.args, ...b.args]);
            if (ns.length === 1) return right(ns[0]);
            return right(product(ns));
          } else if (isprod(a)) {
            const ns = multiply([...a.args, b]);
            if (ns.length === 1) return right(ns[0]);
            return right(product(ns));
          } else if (isprod(b)) {
            const ns = multiply([a, ...b.args]);
            if (ns.length === 1) return right(ns[0]);
            return right(product(ns));
          } else {
            return right(product([a, b]));
          }
        } else if (op.is(tt.caret)) {
          if ((isnum(a) && a.isZero) && (isnum(b))) {
            if (b.isPositive || isfrac(b)) return right(int(0));
          } else if (isnum(a) && a.isOne) {
            return right(int(1));
          } else if (issym(a) && isnum(b) && b.isZero) {
            return right(int(1));
          } else if (issym(a) && isnum(b) && b.isOne) {
            return right(a);
          } else {
            return right(power([a, b]));
          }
        } else if (op.is(tt.slash)) {
          if (isnum(b) && b.isZero) {
            return right(Undefined());
          } else if (isnum(b) && b.isOne) {
            return right(a);
          } else if (isnum(a) && isnum(b)) {
            return right(a.div(b));
          } else {
            return right(quotient([a, b]));
          }
        } else if (op.is(tt.minus)) {
          if (isnum(b) && b.isZero) {
            return right(a);
          } else if (isnum(a) && a.isZero) {
            return right(product([-1, b]));
          } else {
            return right(diff([a, b]));
          }
        } else if (a.isUndefined || b.isUndefined) {
          return right(Undefined());
        }
        return left(algebraError(`Unknown op`));
      })
    );
    return out;
  }
  vector(node: VectorExpr): Result {
    return this.croak(`Vector`);
  }
  matrix(node: MatrixExpr): Result {
    return this.croak(`Matrix`);
  }
  fnCall(node: FnCall): Result {
    return this.croak(`User function`);
  }
  nativeCall(node: NativeCall): Result {
    return this.croak(`Native function`);
  }
  relation(node: RelationExpr): Result {
    return this.croak(`Relation`);
  }
  notExpr(node: NotExpr): Result {
    return this.croak(`Not`);
  }
  logicExpr(node: LogicalExpr): Result {
    return this.croak(`Logical`);
  }
  group(node: Group): Result {
    const out = this.ap(node.expression);
    return out.map((e) => e.tickparen());
  }
  assign(node: AssignExpr): Result {
    return this.croak(`assign`);
  }
  private croak(kind: string) {
    return left(algebraError(`Bad type: ${kind}`));
  }
}
export const reduce = (expression: Left<Err> | Right<Expr>) => (
  new Reducer().reduce(expression)
);

// const a = power([sum([1,'x']), 2])
// const b = power([sum([1,'x']), 3])
// const c = power([sum([1,'y']), 2])

/**
 * Sorts the given list of expressions.k
 */
export const sortex = (exprs: E[]) => {
  return [...exprs].sort((a, b) => prec(a, b) ? -1 : 1);
};

/**
 * Returns an array of the complete subexpressions
 * of the given expression.
 */
export const subex = (expression: Expression) => {
  const out: E[] = [];
  const f = (e: E | null) => {
    if (e === null) return null;
    if (e.isConstant) {
      out.push(e);
      return null;
    } else {
      out.push(e);
      (e as Compound).args.forEach((x) => {
        out.push(x);
      });
      return null;
    }
  };
  f(expression);
  return out;
};

/**
 * Returns true if the provided expression is free of the
 * given variable.
 */
export const freeof = (expression: Expression, variable: string) => {
  const t = sym(variable);
  const f = (u: E) => {
    if (u.equals(t)) {
      return false;
    } else if (isint(u) || issym(u) || isfrac(u)) {
      return true;
    } else {
      let i = 1;
      while (i <= u.opcount) {
        if (!f(u.operand(i))) return false;
        i = i + 1;
      }
      return true;
    }
  };
  return f(expression);
};

const src = `
2x + 1
`;
const p = algebra(imul(symsplit(lexemes(src))));
const s = reduce(p).map(x => freeof(x, 'y'));
print(treeof(s));
