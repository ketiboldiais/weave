import {
  Fraction,
  isarray,
  Maybe,
  none,
  print,
  simplify,
  Some,
  some,
  toFrac,
} from "./util.js";

interface AlgebraVisitor<T> {
  int(int: Int): T;
  sym(sym: Sym): T;
  diff(diff: Difference): T;
  quotient(quot: Quotient): T;
  sum(sum: Sum): T;
  product(product: Product): T;
  power(power: Power): T;
  factorial(factorial: Factorial): T;
  func(fn: FunctionCall): T;
  fraction(fraction: Fractional): T;
}

enum op {
  int = "int",
  symbol = "symbol",
  fraction = "fraction",
  fun = "fun",
  power = "^",
  factorial = "!",
  sum = "+",
  product = "*",
  diff = "-",
  quot = "/",
}

export abstract class AlgebraicExpr {
  op: op;
  parenLevel: number = 0;
  abstract accept<T>(visitor: AlgebraVisitor<T>): T;
  constructor(op: op) {
    this.op = op;
  }
  tickParen() {
    this.parenLevel++;
    return this;
  }
  abstract copy(): AlgebraicExpr;
  abstract seqmap(pairs: ([AlgebraicExpr, AlgebraicExpr])[]): AlgebraicExpr;
  abstract substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr;
  abstract toString(): string;
  abstract equals(expr: AlgebraicExpr): boolean;
  abstract opcount(): number | null;
  abstract freeof(expr: AlgebraicExpr): boolean;
}

const nType =
  <T extends AlgebraicExpr>(op: op) => (node: AlgebraicExpr): node is T => (
    node.op === op
  );

type Prim = string | number | Fraction;

export abstract class Atom<X extends Prim = Prim> extends AlgebraicExpr {
  op: op.int | op.symbol | op.fraction;
  x: X;
  constructor(x: X, op: op.int | op.symbol | op.fraction) {
    super(op);
    this.op = op;
    this.x = x;
  }
  equals(expr: AlgebraicExpr): boolean {
    if (!(expr instanceof Atom)) return false;
    if (this.x instanceof Fraction) {
      if (expr.x instanceof Fraction) {
        const [t, u] = simplify([this.x.n, this.x.d]);
        const [v, w] = simplify([this.x.n, this.x.d]);
        return (t === v) && (u === w);
      } else if (typeof expr.x === "number") {
        const [n, d] = toFrac(expr.x);
        return (n === this.x.n) && (d === this.x.d);
      } else if (typeof expr.x === "string") {
        return (this.x.toString() === expr.x);
      }
    }
    return expr.x === this.x;
  }
  toString(): string {
    return `${this.x.toString()}`;
  }
  opcount(): number | null {
    return null;
  }
  freeof(expr: AlgebraicExpr): boolean {
    return !this.equals(expr);
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    return this.equals(expr) ? b : this;
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    for (let i = 0; i < pairs.length; i++) {
      const [a, b] = pairs[i];
      if (this.equals(a)) return b;
    }
    return this;
  }
}

export const isatom = (n: AlgebraicExpr): n is Atom => (
  n.op === op.symbol ||
  n.op === op.int ||
  n.op === op.fraction
);

export class Fractional extends Atom {
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.fraction(this);
  }
  copy(): Fractional {
    return new Fractional(this.x.copy());
  }
  x: Fraction;
  constructor(f: Fraction) {
    super(f, op.fraction);
    this.x = f;
  }
}

export const nFrac = (xs: [number, number] | Fraction) => (
  new Fractional(isarray(xs) ? Fraction.from(xs) : xs)
);
export const isfrac = nType<Atom<Fraction>>(op.fraction);

export class Int extends Atom {
  x: number;
  constructor(n: number) {
    super(n, op.int);
    this.x = n;
  }
  copy(): Int {
    return new Int(this.x);
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.int(this);
  }
}
export const isint = nType<Atom<number>>(op.int);

export const int = (n: number) => (
  new Int(n)
);

export class Sym extends Atom {
  x: string;
  constructor(s: string) {
    super(s, op.symbol);
    this.x = s;
  }
  copy(): Sym {
    return new Sym(this.x);
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.sym(this);
  }
}

export const issym = nType<Atom<string>>(op.symbol);

export const sym = (n: string) => (
  new Sym(n)
);

export abstract class CompoundExpr extends AlgebraicExpr {
  args: AlgebraicExpr[];
  constructor(op: op, args: AlgebraicExpr[]) {
    super(op);
    this.args = args;
  }
  equals(expr: AlgebraicExpr): boolean {
    if (!(expr instanceof CompoundExpr)) return false;
    if (expr.args.length !== this.args.length) return false;
    if (this.op !== expr.op) return false;
    const ns = expr.args.reduce((p, c, i) => p && c.equals(this.args[i]), true);
    return ns;
  }
  opcount(): number | null {
    return this.args.length;
  }
  freeof(expr: AlgebraicExpr): boolean {
    return this.args.reduce((p, c) => p && c.freeof(expr), true);
  }
  operand(i: number) {
    const out = this.args[i];
    if (out === undefined) return sym("undefined");
    return out;
  }
}

export class Difference extends CompoundExpr {
  constructor(args: AlgebraicExpr[]) {
    super(op.diff, args);
  }
  copy(): Difference {
    const args = this.args.map((v) => v.copy());
    return new Difference(args);
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.diff(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("-");
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const out = this.args.map((a) => a.substitute(expr, b));
    return diff(out);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const out = this.args.map((a) => a.seqmap(pairs));
    return diff(out);
  }
}

export const isdiff = nType<Difference>(op.diff);

export const diff = (args: AlgebraicExpr[]) => (
  new Difference(args)
);

export class Quotient extends CompoundExpr {
  constructor(args: AlgebraicExpr[]) {
    super(op.quot, args);
  }
  copy(): Quotient {
    const args = this.args.map((a) => a.copy());
    const out = new Quotient(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.quotient(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("/");
  }

  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const args = this.args.map((a) => a.substitute(expr, b));
    return quotient(args);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((a) => a.seqmap(pairs));
    return quotient(args);
  }
}
export const isquot = nType<Quotient>(op.quot);
export const isCompound = (node: AlgebraicExpr): node is CompoundExpr => (
  !isatom(node)
);
export const quotient = (args: AlgebraicExpr[]) => (
  new Quotient(args)
);

export class Sum extends CompoundExpr {
  constructor(args: AlgebraicExpr[]) {
    super(op.sum, args);
  }
  copy(): Sum {
    const args = this.args.map((a) => a.copy());
    const out = sum(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.sum(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("+");
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const args = this.args.map((a) => a.substitute(expr, b));
    return sum(args);
  }
  distribute(expr: AlgebraicExpr) {
    const out: AlgebraicExpr[] = [];
    for (let i = 0; i < this.args.length; i++) {
      out.push(product([expr, this.args[i]]));
    }
    return sum(out);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((a) => a.seqmap(pairs));
    return sum(args);
  }
}

export const sum = (args: AlgebraicExpr[]) => (
  new Sum(args)
);

export const issum = nType<Sum>(op.sum);

export class Product extends CompoundExpr {
  constructor(args: AlgebraicExpr[]) {
    super(op.product, args);
  }
  copy(): Product {
    const args = this.args.map((a) => a.copy());
    const out = product(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.product(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("*");
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const args = this.args.map((a) => a.substitute(expr, b));
    return product(args);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((n) => n.seqmap(pairs));
    return product(args);
  }
}
export const product = (args: AlgebraicExpr[]) => {
  return new Product(sortargs(args));
};

export const isprod = nType<Product>(op.product);

export class Power extends CompoundExpr {
  args: AlgebraicExpr[];
  constructor(args: AlgebraicExpr[]) {
    super(op.power, args);
    this.args = args;
  }
  copy(): AlgebraicExpr {
    const args = this.args.map((c) => c.copy());
    const out = power(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  get base() {
    return this.args[0];
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.power(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("^");
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const args = this.args.map((a) => a.substitute(expr, b));
    return power(args);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((n) => n.seqmap(pairs));
    return power(args);
  }
}
export const power = (args: AlgebraicExpr[]) => (
  new Power(args)
);

export const ispow = nType<Power>(op.power);

export class Factorial extends CompoundExpr {
  constructor(args: AlgebraicExpr[]) {
    super(op.factorial, args);
  }
  copy(): AlgebraicExpr {
    const args = this.args.map((a) => a.copy());
    const out = factorial(args);
    out.parenLevel = this.parenLevel;
    return out;
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((p) => p.seqmap(pairs));
    return factorial(args);
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.factorial(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return ls.join("") + "!";
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    const as = this.args.map((n) => n.substitute(expr, b));
    return factorial(as);
  }
}
export const factorial = (args: AlgebraicExpr[]) => (
  new Factorial(args)
);

export const isfact = nType<Factorial>(op.factorial);

export class FunctionCall extends AlgebraicExpr {
  name: string;
  args: AlgebraicExpr[];
  constructor(name: string, args: AlgebraicExpr[]) {
    super(op.fun);
    this.name = name;
    this.args = args;
  }
  copy(): AlgebraicExpr {
    const name = this.name;
    const args = this.args.map((a) => a.copy());
    return fun(name, args);
  }
  seqmap(pairs: [AlgebraicExpr, AlgebraicExpr][]): AlgebraicExpr {
    const args = this.args.map((p) => p.seqmap(pairs));
    return fun(this.name, args);
  }
  freeof(expr: AlgebraicExpr): boolean {
    return this.args.reduce((p, c) => p && c.freeof(expr), true);
  }
  substitute(expr: AlgebraicExpr, b: AlgebraicExpr): AlgebraicExpr {
    return this.equals(expr) ? b : this;
  }
  opcount(): number | null {
    return this.args.length;
  }
  equals(expr: AlgebraicExpr): boolean {
    if (!(expr instanceof FunctionCall)) return false;
    if (expr.name !== this.name) return false;
    if (this.args.length !== expr.args.length) return false;
    const ns = expr.args.reduce((p, c, i) => p && c.equals(this.args[i]), true);
    return ns;
  }
  accept<T>(visitor: AlgebraVisitor<T>): T {
    return visitor.func(this);
  }
  toString(): string {
    const ls = this.args.map((n) => n.toString());
    return this.name + "(" + ls.join(",") + ")";
  }
}
export const fun = (name: string, args: AlgebraicExpr[]) => (
  new FunctionCall(name, args)
);

export const isfun = nType<FunctionCall>(op.fun);

const sortargs = (nodes: AlgebraicExpr[]) => (
  [...nodes].sort((a, b) => a.toString() < b.toString() ? -1 : 1)
);

const freeof = (expr: AlgebraicExpr, t: AlgebraicExpr) => {
  const f = (u: AlgebraicExpr) => {
    if (u.equals(t)) return false;
    else if (isatom(u)) return true;
    else {
      let i = 0;
      while (i <= u.opcount()!) {
        if (!isCompound(u)) return false;
        const op = u.operand(i);
        if (!f(op)) return false;
        i = i + 1;
      }
      return true;
    }
  };
  return f(expr);
};

const subexpressions = (expr: AlgebraicExpr) => {
  const out: AlgebraicExpr[] = [];
  const f = (e: AlgebraicExpr | null) => {
    if (e === null) return;
    if (isatom(e)) {
      out.push(e);
      return null;
    } else if (e instanceof CompoundExpr) {
      out.push(e);
      e.args.forEach((x) => f(x));
      return null;
    } else if (isfun(e)) {
      out.push(e);
      e.args.forEach((x) => f(x));
      return null;
    }
    return null;
  };
  f(expr);
  return out;
};

/**
 * Determines the given algebraic expression
 * has the form `ax + b`, where the expressions
 * `a` and `b` are free of x.
 */
const linearForm = (e: AlgebraicExpr, x: Sym) => {
  let f: Maybe<any> = none();
  let r: Maybe<any> = none();
  const fn = (u: AlgebraicExpr) => {
    print(u);
    if (u.equals(x)) {
      return some([int(1), int(0)]);
    } else if (isatom(u)) {
      return some([int(0), u]);
    } else if (isprod(u)) {
      if (freeof(u, x)) {
        return some([int(0), u]);
      } else if (freeof(quotient([u, x]), x)) {
        return some([quotient([u, x]), int(0)]);
      } else {
        return none();
      }
    } else if (issum(u)) {
      f = fn(u.operand(1));
      if (f._tag === "None") return none();
      else {
        r = fn(diff([u, u.operand(1)]));
        if (r._tag === "None") return none();
        else {
          const F: CompoundExpr = (f as Some<CompoundExpr>).value;
          const R: CompoundExpr = (r as Some<CompoundExpr>).value;
          return some([
            sum([F.operand(1), R.operand(1)]),
            sum([F.operand(2), R.operand(2)]),
          ]);
        }
      }
    } else if (freeof(u, x)) {
      return some([int(0), x]);
    } else {
      return none();
    }
  };
  return fn(e);
};

export const raise = (exprs: AlgebraicExpr[], exponent: AlgebraicExpr) => {
  const out = exprs.map((n) => power([n, exponent]));
  return out;
};

/**
 * Returns an n-ary product of the given
 * expression.
 */
export const ntimes = (n: number, expr: AlgebraicExpr) => {
  if (n < 0) {
    return none();
  }
  if (n <= 0) {
    return some(product([int(1), expr]));
  }
  const args: AlgebraicExpr[] = [];
  for (let i = 0; i < n; i++) {
    args.push(expr.copy());
  }
  return some(product(args));
};
