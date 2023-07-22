import {
  frac,
  Fraction,
  isarray,
  Maybe,
  None,
  none,
  print,
  simplify,
  Some,
  some,
  toFrac,
  tpl,
} from "./util.js";

export type OP = `::${string}::` | "+" | "-" | "/" | "!" | "*" | "^";
export type ATOM = "int" | "fraction" | "real" | "symbol";
export type et = OP | ATOM;
export interface ExpressionVisitor<T> {
  int(integer: Int): T;
  frac(fraction: Rational): T;
  sym(symbol: Sym): T;
  sum(sum: Sum): T;
  product(product: Product): T;
  difference(diff: Difference): T;
  quotient(quotient: Quotient): T;
  factorial(fact: Factorial): T;
  power(power: Power): T;
  call(call: FunCall): T;
}

export abstract class Expression {
  kind: et;
  klass: "atom" | "compound";
  parenLevel: number = 0;
  abstract accept<T>(visitor: ExpressionVisitor<T>): T;
  constructor(type: et, exprclass: "atom" | "compound") {
    this.kind = type;
    this.klass = exprclass;
  }
  abstract forEachChild(callback: (c: Expression, kind: et) => void): this;
  abstract copy(): Expression;
  /**
   * Returns the number of operands in this expression.
   * Atoms will always return an operand count of `None`,
   * and compounds will always return an operand count
   * of `Some<number>`.
   */
  abstract operandCount(): Some<number> | None;
  /**
   * Returns the operand at the ith index of the expression.
   * Atoms will always return `None`. Compounds will return
   * `Some<Expression>` if an expression exists at that
   * index, otherwise `None`.
   */
  abstract operand(i: number): Some<Expression> | None;
  abstract equals(other: Expression): boolean;
  abstract toString(): string;
  tickParen(): void {
    this.parenLevel++;
    return;
  }
}
export const isatom = (node: Expression): node is Atom => (
  node.klass === "atom"
);
export const iscompound = (node: Expression): node is Compound => (
  node.klass === "compound"
);

const typeguard =
  <T extends Expression>(type: et) => (expr: Expression): expr is T => (
    expr.kind === type
  );

// =============================================================================
// Atomic Expressions
// =============================================================================

export type Primitive = number | Fraction | string;

export abstract class Atom<T extends Primitive = Primitive> extends Expression {
  value: T;
  constructor(value: T, exprtype: et) {
    super(exprtype, "atom");
    this.value = value;
  }
  forEachChild(callback: (c: Expression, kind: et) => void) {
    return this;
  }
  get is1() {
    if (typeof this.value === "number") {
      return this.value === 1;
    } else if (typeof this.value === "string") {
      return false;
    } else {
      return this.value.is1;
    }
  }
  get is0() {
    if (typeof this.value === "number") {
      return this.value === 0;
    } else if (typeof this.value === "string") {
      return false;
    } else {
      return this.value.is0;
    }
  }
  toString(): string {
    return this.value.toString();
  }
  operand(i: number): Some<Expression> | None {
    return none();
  }
  operandCount(): None {
    return none();
  }
  equals(other: Expression): boolean {
    if (!isatom(other)) return false;
    if (this.kind === "fraction" && other.kind === "fraction") {
      const a = this.value as Fraction;
      const b = other.value as Fraction;
      return a.equals(b);
    }
    return this.value === other.value;
  }
}

// Integer .....................................................................

export class Int extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.int(this);
  }
  value: number;
  constructor(value: number) {
    super(value, "int");
    this.value = value;
  }
  map(callback: (value: number) => number): Int {
    return int(callback(this.value));
  }
  toFrac() {
    return Fraction.from([this.value, 1]);
  }
  copy(): Expression {
    return int(this.value);
  }
}

export const int = (n: number) => (
  new Int(n)
);

export const isint = typeguard<Atom<number>>("int");

// Rational ....................................................................

export class Rational extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.frac(this);
  }
  value: Fraction;
  constructor(value: Fraction) {
    super(value, "fraction");
    this.value = value;
  }
  map(callback: (f: Fraction) => Fraction): Rational {
    return rational(callback(this.value.copy()));
  }
  copy(): Rational {
    return rational(this.value.copy());
  }
  get numerator() {
    return int(this.value.n);
  }
  get denominator() {
    return int(this.value.d);
  }
}

export const isfrac = typeguard<Atom<Fraction>>("fraction");

export const rational = (n: [number, number] | Fraction) => (
  new Rational(isarray(n) ? Fraction.from(n) : n)
);

// Symbol ......................................................................

export class Sym extends Atom {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sym(this);
  }
  value: string;
  constructor(value: string) {
    super(value, "symbol");
    this.value = value;
  }
  map(callback: (sym: string) => string): Sym {
    return sym(callback(this.value));
  }
  copy(): Expression {
    return sym(this.value);
  }
}

export const sym = (value: string) => (
  new Sym(value)
);

export const issym = typeguard<Atom<string>>("symbol");

// =============================================================================
// Compound Expressions
// =============================================================================

abstract class Compound extends Expression {
  op: OP;
  args: Expression[];
  constructor(op: OP, args: Expression[]) {
    super(op, "compound");
    this.op = op;
    this.args = args;
  }
  forEachChild(callback: (c: Expression, kind: et) => void) {
    this.args.forEach((c) => callback(c, this.op));
    return this;
  }
  get arity() {
    return this.args.length;
  }
  operand(i: number): Some<Expression> | None {
    const out = this.args[i - 1];
    if (out === undefined) return none();
    return some(out);
  }
  equals(other: Expression): boolean {
    if (!(iscompound(other))) return false;
    if (this.op !== other.op) return false;
    if (this.args.length !== other.args.length) return false;
    return other.args.reduce((p, c, i) => p && this.args[i].equals(c), true);
  }
  operandCount(): Some<number> {
    return some(this.args.length);
  }
  toString(): string {
    const out = this.args.map((c) => c.toString()).join(` ${this.op} `);
    if (this.parenLevel !== 0) {
      return `(${out})`;
    } else return out;
  }
}

// Product Expression  - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class Product extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.product(this);
  }
  constructor(args: Expression[]) {
    super("*", args);
  }
  map(callback: (arg: Expression) => Expression): Product {
    const out = product(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = product(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const isproduct = typeguard<Product>("*");
export const product = (factors: Expression[]) => {
  const args = [];
  for (let i = 0; i < factors.length; i++) {
    const arg = factors[i];
    if (isproduct(arg)) {
      arg.args.forEach(a => args.push(a));
    } else {
      args.push(arg);
    }
  }
  return new Product(args);
};

// Sum Expression  - - - - - - - - - - - - - - - - - -- - - - - - - - - - - - -

export class Sum extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sum(this);
  }
  constructor(args: Expression[]) {
    super("+", args);
  }
  map(callback: (arg: Expression) => Expression): Sum {
    const out = sum(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = sum(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  gather() {
    const args: Expression[] = [];
    for (let i = 0; i < this.args.length; i++) {
      const arg = this.args[i];
      if (issum(arg)) {
        arg.args.forEach((a) => args.push(a));
      } else {
        args.push(arg);
      }
    }
    const fractions: (Fraction)[] = [];
    const numbers: number[] = [];
    const finalargs = [];
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (isint(arg)) {
        numbers.push(arg.value);
      } else if (isfrac(arg)) {
        fractions.push(arg.value);
      } else {
        finalargs.push(arg);
      }
    }
    let ns: number | null = null;
    if (numbers.length) {
      ns = numbers.reduce((p, n) => p + n, 0);
    }
    let fs: Fraction | null = null;
    if (fractions.length) {
      fs = fractions.reduce((p, c) => c.add(p));
    }
    if (ns !== null) {
      finalargs.push(int(ns));
    }
    if (fs !== null) {
      const r = rational(fs);
      if (r.denominator.is1) {
        finalargs.push(r.numerator);
      } else {
        finalargs.push(r);
      }
    }
    return sum(finalargs);
  }
  leftDistribute(expr: Atom) {
    const args: Expression[] = [];
    for (let i = 0; i < this.arity; i++) {
      args.push(product([expr, this.args[i]]));
    }
    return sum(args);
  }
  rightDistribute(expr: Atom) {
    const args: Expression[] = [];
    for (let i = 0; i < this.arity; i++) {
      args.push(product([this.args[i], expr]));
    }
    return sum(args);
  }
}

export const issum = typeguard<Sum>("+");
export const sum = (args: Expression[]) => {
  const terms = [];
  for (let i = 0; i < args.length; i++) {
    const term = args[i];
    if (issum(term)) {
      term.args.forEach((x) => terms.push(x));
    } else {
      const nxt = args[i + 1];
      if (nxt) {
        if (isint(term) && isint(nxt)) {
          args.push(int(term.value + nxt.value));
          i++;
          continue;
        } else if (isint(term) && isfrac(nxt)) {
          const t = rational(nxt.value.add(Fraction.from(term.value)));
          if (t.denominator.is1) {
            args.push(t.numerator);
          } else {
            args.push(t);
          }
          i++;
          continue;
        } else if (isint(nxt) && isfrac(term)) {
          const t = rational(term.value.add(Fraction.from(nxt.value)));
          if (t.denominator.is1) {
            args.push(t.numerator);
          } else {
            args.push(t);
          }
          i++;
          continue;
        }
      }
      terms.push(term);
    }
  }
  return new Sum(terms);
};

// Difference Expression - - - - - - - - - - - - - - - - - - - - - - - - - - - -

class Difference extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.difference(this);
  }
  constructor(args: Expression[]) {
    super("-", args);
  }
  map(callback: (arg: Expression) => Expression): Difference {
    const out = diff(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = diff(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const isdiff = typeguard<Difference>("-");
export const diff = (args: Expression[]) => (
  new Difference(args)
);

// Power Expression - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class Power extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.power(this);
  }
  constructor(args: Expression[]) {
    super("^", args);
  }
  map(callback: (arg: Expression) => Expression): Power {
    const out = power(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = power(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const ispower = typeguard<Power>("^");
export const power = (args: Expression[]) => (
  new Power(args)
);

// Quotient Expression  - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class Quotient extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.quotient(this);
  }
  constructor(args: Expression[]) {
    super("/", args);
  }
  map(callback: (arg: Expression) => Expression): Quotient {
    const out = quotient(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = quotient(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const isquotient = typeguard<Quotient>("/");
export const quotient = (args: Expression[]) => (
  new Quotient(args)
);

// Factorial Expression  - - - - - - - - - - - - - - - - - - - - - - - - - - - -

export class Factorial extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.factorial(this);
  }
  constructor(args: Expression[]) {
    super("!", args);
  }
  map(callback: (arg: Expression) => Expression): Factorial {
    const out = factorial(this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = factorial(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const isfactorial = typeguard<Factorial>("!");
export const factorial = (args: Expression[]) => (
  new Factorial(args)
);

// Function Call Expression  - - - - - - - - - - - - - - - - - - - - - - - - - -

export class FunCall extends Compound {
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.call(this);
  }
  constructor(name: string, args: Expression[]) {
    super(`::${name}::`, args);
  }
  map(callback: (arg: Expression) => Expression): FunCall {
    const out = fun(this.op, this.args.map(callback));
    out.parenLevel = this.parenLevel;
    return out;
  }
  fname() {
    const x = this.op.slice(2, this.op.length - 2);
    return x;
  }
  toString(): string {
    const f = this.fname();
    const out = f + "(" + this.args.map((c) => c.toString()).join(",") + ")";
    if (this.parenLevel !== 0) {
      return `(${out})`;
    } else return out;
  }
  copy(): Expression {
    const args = this.args.map((a) => a.copy());
    const out = fun(this.op, args);
    out.parenLevel = this.parenLevel;
    return out;
  }
}
export const isfuncall = (expr: Expression): expr is FunCall => (
  expr.kind.startsWith("::")
);
export const fun = (name: string, args: Expression[]) => (
  new FunCall(name, args)
);
const negate = (expr: Expression) => (
  fun("-", [expr])
);

// Auxiliary Methods ===========================================================

/**
 * Constructs an expression based from the given operator and operands.
 */
export const exp = (op: OP, operands: (Expression | string | number)[]) => {
  const args = operands.map((c) => {
    if (typeof c === "number") return int(c);
    else if (typeof c === "string") return sym(c);
    else if (c instanceof Compound) {
      c.tickParen();
      return c;
    } else return c;
  });
  // deno-fmt-ignore
  switch (op) {
    case "!": return factorial(args);
    case "*": return product(args);
    case "+": return sum(args);
    case "-": return diff(args);
    case "/": return quotient(args);
    case "^": return power(args);
    default: {
      const [_,b] = op.split('-');
      return fun(b, args);
    }
  }
};

/**
 * Ensures that arguments to auxiliary methods are always of type
 * Expression.
 */
export const toExpr = (input: number | string | Expression): Expression => (
  (typeof input === "number")
    ? (int(input))
    : (typeof input === "string")
    ? (sym(input))
    : input
);

/**
 * Returns true if the given expression
 * does not contain the given target.
 *
 * @param expression - The expression to check for.
 * @param target - The expression to search for. If a number
 * is passed, is cast to an integer. If a string is passed,
 * it is cast to a symbol.
 */
export const freeof = (
  expression: Expression,
  target: Expression | number | string,
) => {
  const t = toExpr(target);
  const f = (u: Expression) => {
    if (u.equals(t)) return false;
    else if (isatom(u)) return true;
    else {
      let i = 1;
      const C = u as Compound;
      while (i <= C.operandCount().value) {
        const op = C.operand(i);
        if (op._tag === "None") return false;
        const operand = op.value;
        if (!f(operand)) return false;
        i = i + 1;
      }
      return true;
    }
  };
  return f(expression);
};

/**
 * Returns a list of all the complete subexpressions
 * of the given expression.
 */
export const subex = (expression: Expression) => {
  const out: Expression[] = [];
  const f = (e: Expression | null) => {
    if (e === null) return;
    if (isatom(e)) {
      out.push(e);
      return null;
    } else {
      const C = e as Compound;
      out.push(C);
      C.args.forEach((e) => f(e));
      return null;
    }
  };
  f(expression);
  return out;
};

