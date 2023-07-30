/**
 * Utility method - Logs to the console.
 */
const print = console.log;

/**
 * Utility function for zipping lists.
 */
const zip = <A extends any[], B extends any[]>(
  array1: A,
  array2: B,
): ([A[number], B[number]])[] =>
  (
    array1.reduce((acc, curr, ind): ([A[number], B[number]])[] => {
      acc.push([curr, array2[ind]]);
      return acc;
    }, [])
  ).filter(([a, b]: [A[number], B[number]]) =>
    a !== undefined && b !== undefined
  );

const { floor, abs, min, max } = Math;

/**
 * Returns `a rem b` (the signed remainder).
 */
const rem = (a: number, b: number) => (a % b);

/**
 * Returns `a mod b` (the unsigned remainder).
 */
const mod = (a: number, b: number) => (
  ((a % b) + b) % b
);

/**
 * Returns the integer quotient of `a` and `b`.
 */
const quot = (a: number, b: number) => (floor(a / b));

/**
 * Returns a tuple.k
 */
function tuple<T extends any[]>(...data: T) {
  return data;
}

/**
 * Returns the greatest common divisor of integers
 * `a` and `b`.
 */
function gcd(a: number, b: number) {
  let A = floor(a);
  let B = floor(b);
  while (B !== 0) {
    let R = rem(A, B);
    A = B;
    B = R;
  }
  return abs(A);
}

/**
 * Returns the resulting triple of applying
 * the extended Euclidean algorithm.
 */
function xgcd(a: number, b: number) {
  let A = floor(a);
  let B = floor(b);
  let mpp = 1;
  let mp = 0;
  let npp = 0;
  let np = 1;
  while (B !== 0) {
    let Q = quot(A, B);
    let R = rem(A, B);
    A = B;
    B = R;
    let m = mpp - Q * mp;
    let n = npp - Q * np;
    mpp = mp;
    mp = m;
    npp = np;
    np = n;
  }
  if (A >= 0) {
    return tuple(A, mpp, npp);
  } else {
    return tuple(-A, -mpp, -npp);
  }
}

/**
 * Utility method - returns a string wherein
 * the given string or number is surrounded in
 * parentheses.
 */
const parend = (s: string | number) => (
  `(${s})`
);

/**
 * The `core` enum is an enumeration of constant strings
 * that ensures the core operation symbols are consistent
 * throughought the code base.
 */
enum core {
  int = "int",
  real = "real",
  complex = "complex",
  fraction = "fraction",
  symbol = "symbol",
  constant = "constant",
  sum = "+",
  difference = "-",
  product = "*",
  quotient = "/",
  power = "^",
  factorial = "!",
  undefined = "Undefined",
}

type BaseOp =
  | core.factorial
  | core.sum
  | core.product
  | core.difference
  | core.power
  | core.quotient;

enum klass {
  atom,
  compound,
}

abstract class Expression<A extends string = string> {
  /**
   * Returns true if this expression is syntactically
   * equal to the provided expression. Otherwise,
   * returns false.
   */
  abstract equals(other: Expression): boolean;
  /**
   * Returns this expression as a string.
   */
  abstract toString(): string;
  /**
   * Returns a copy of this expression.
   */
  abstract copy(): Expression;
  /**
   * Returns the ith operand of this expression.
   * If this expression is not a compound expression,
   * returns {@link Undefined}.
   */
  abstract operand(i: number): Expression;
  /**
   * Returns the number of operands of this expression.
   * If this expression is not a compound expression,
   * returns 0.
   */
  abstract get numberOfOperands(): number;
  /**
   * This expressions operator.
   */
  readonly op: A;
  /**
   * The parentheses level of this expression.
   */
  parenLevel: number = 0;
  /**
   * Increments the parentheses level of this expression.
   * This method should be called if an expression is
   * surrounded by parentheses.
   */
  tickParen() {
    this.parenLevel += 1;
    return this;
  }
  /**
   * Returns true if this expression and the provided
   * expression have the same parentheses level.
   */
  sameParenLevel(other: Expression) {
    return this.parenLevel === other.parenLevel;
  }
  /**
   * This expression’s overarching class. This is
   * an enum value of {@link klass}. Either:
   *
   * 1. `klass.atom` (corresponding to an atomic expression), or
   * 2. `klass.compound` (corresponding to a compound expression).
   */
  klass: klass;
  constructor(op: A, klass: klass) {
    this.op = op;
    this.klass = klass;
  }
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is an {@link Atom|atomic expression}. False otherwise.
 */
function isAtom(u: Expression): u is Atom {
  return u.klass === klass.atom;
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is a {@link Compound|compound expression}. False otherwise.
 */
function isCompound(u: Expression): u is Compound {
  return u.klass === klass.compound;
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is an {@link Int|integer}. False otherwise.
 */
function isInt(u: Expression): u is Int {
  return u.op === core.int;
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is a {@link Real|real number}. False otherwise.
 */
function isReal(u: Expression): u is Real {
  return u.op === core.real;
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is a {@link Sym|symbol}. False otherwise. Note that this will
 * return true if `u` is `Undefined`, since `Undefined` is a symbol
 * by definition.
 */
function isSymbol(u: Expression): u is Sym {
  return (u.op === core.symbol) || (u.op === core.undefined);
}

/**
 * Type predicate. Claims and returns true if the given expression
 * `u` is a {@link Undefined|undefined}. False otherwise. Note
 * that constant `Undefined` maps to the literal null.
 */
function isUndefined(u: Expression): u is Constant<null, core.undefined> {
  return u.op === core.undefined;
}

/**
 * Type predicate. Returns true if the given expression is a constant,
 * false otherwise. If true, claims that `u` is a {@link Constant|constant type number}.
 */
function isConstant(u: Expression): u is Constant<number> {
  return u.op === core.constant;
}

/**
 * An atom is any expression that cannot be reduced further.
 * This includes:
 *
 * 1. {@link Int|integers},
 * 2. {@link Real|reals},
 * 3. {@link Sym|symbols},
 *
 * Atoms are the building blocks of all other expressions.
 */
abstract class Atom extends Expression {
  klass: klass.atom = klass.atom;
  constructor(op: string) {
    super(op, klass.atom);
  }
  get numberOfOperands(): number {
    return 0;
  }
  operand(i: number): UNDEFINED {
    return Undefined();
  }
}

/**
 * An atomic value corresponding to an integer.
 */
class Int extends Atom {
  copy(): Int {
    const out = int(this.n);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: Expression<string>): boolean {
    if (!isInt(other)) return false;
    return (other.n === this.n) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.n}`;
  }
  n: number;
  constructor(n: number) {
    super(core.int);
    this.n = n;
  }
  get isNegative() {
    return this.n < 0;
  }
  get isPositive() {
    return this.n > 0;
  }
  /**
   * Returns true if this integer is 1.
   * False otherwise.
   */
  get isOne() {
    return this.n === 1;
  }
  /**
   * Returns true if this integer is 0.
   * False otherwise.
   */
  get isZero() {
    return this.n === 0;
  }
}

/**
 * Returns a new {@link Int|integer}.
 */
function int(n: number) {
  return (new Int(n));
}

/**
 * An atomic value corresponding to a floating point number.
 */
class Real extends Atom {
  copy(): Real {
    const out = real(this.n);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: Expression<string>): boolean {
    if (!isReal(other)) {
      return false;
    }
    return (this.n === other.n) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.n}`;
  }
  n: number;
  constructor(n: number) {
    super(core.real);
    this.n = n;
  }
}

/**
 * Returns a new {@link Real|real}.
 */
function real(r: number) {
  return (new Real(r));
}

/**
 * An atomic value corresponding to a symbol.
 */
class Sym<X extends string = string> extends Atom {
  copy(): Sym {
    const out = sym(this.s);
    out.parenLevel = this.parenLevel;
    return out;
  }
  equals(other: Expression<string>): boolean {
    if (!isSymbol(other)) {
      return false;
    }
    return (this.s === other.s) && (this.sameParenLevel(other));
  }
  toString(): string {
    return `${this.s}`;
  }
  s: X;
  constructor(s: X) {
    const type = (s === core.undefined) ? core.undefined : core.symbol;
    super(type);
    this.s = s;
  }
}

/**
 * A node corresponding a numeric constant.
 */
class Constant<
  P extends (number | null) = (number | null),
  X extends string = string,
> extends Atom {
  equals(other: Expression<string>): boolean {
    if (!isConstant(other)) {
      return false;
    } else {
      return this.sameParenLevel(other) && (other.value === this.value);
    }
  }
  get isNegative() {
    if (this.value === null) {
      return false;
    }
    return this.value < 0;
  }
  get isPositive() {
    if (this.value === null) {
      return false;
    }
    return this.value > 0;
  }
  get isZero() {
    return false;
  }
  get isOne() {
    return false;
  }
  toString(): string {
    if (this.value === null) {
      return `Undefined`;
    } else {
      return `${this.value}`;
    }
  }
  copy() {
    const out = new Constant(this.c, this.value);
    out.parenLevel = this.parenLevel;
    return out;
  }
  c: X;
  value: P;
  constructor(c: X, value: P) {
    super(c === core.undefined ? core.undefined : core.constant);
    this.c = c;
    this.value = value;
  }
}

/**
 * Returns a new Undefined.
 */
function Undefined() {
  return new Constant(core.undefined, null);
}

type UNDEFINED = ReturnType<typeof Undefined>;

/**
 * Returns a new numeric constant.
 */
function constant(c: string, value: number) {
  return new Constant(c, value);
}

/**
 * Returns a new symbol.
 */
function sym(s: string) {
  return new Sym(s);
}

type AlgebraicExpression =
  | Int
  | Sym
  | Constant
  | AlgebraicOp
  | AlgebraicFn;

abstract class Compound<OP extends string = string> extends Expression {
  op: OP;
  args: Expression[];
  klass: klass.compound = klass.compound;
  constructor(op: OP, args: Expression[]) {
    super(op, klass.compound);
    this.op = op;
    this.args = args.map((x) => {
      if (isCompound(x)) {
        x.tickParen();
      }
      return x;
    });
  }
  get numberOfOperands(): number {
    return this.args.length;
  }
  toString(): string {
    const op = this.op;
    const args = this.args.map((x) => x.toString()).join(` ${op} `);
    if (this.parenLevel !== 0) {
      return parend(args);
    }
    return args;
  }
  equals(other: Expression<string>): boolean {
    if (!(other instanceof Compound)) {
      return false;
    }
    if (this.args.length !== other.args.length) return false;
    for (let i = 0; i < this.args.length; i++) {
      const a = this.args[i];
      const b = other.args[i];
      if (!a.equals(b)) {
        return false;
      }
    }
    return this.sameParenLevel(other);
  }
}

type AlgOP =
  | core.sum
  | core.difference
  | core.product
  | core.quotient
  | core.power
  | core.factorial
  | core.fraction;
/**
 * A node corresponding to an algebraic operation.
 * Algebraic operations comprise of:
 *
 * 1. `+`
 * 2. `-`
 * 3. `*`
 * 4. `^`
 * 5. `!`
 * 6. `fraction`
 */
abstract class AlgebraicOp<OP extends AlgOP = AlgOP> extends Compound {
  op: OP;
  args: AlgebraicExpression[];
  abstract copy(): AlgebraicOp;
  constructor(op: OP, args: AlgebraicExpression[]) {
    super(op, args);
    this.op = op;
    this.args = args;
  }
  /**
   * Returns the last operand of this operation.
   */
  last(): AlgebraicExpression {
    const out = this.args[this.args.length - 1];
    if (out === undefined) return Undefined();
    return out;
  }
  /**
   * The first operand of this operation.
   */
  head(): AlgebraicExpression {
    const out = this.args[0];
    if (out === undefined) return Undefined();
    return out;
  }
  /**
   * This operation’s operands, without the
   * first operand.
   */
  tail(): AlgebraicExpression[] {
    const out: AlgebraicExpression[] = [];
    for (let i = 1; i < this.args.length; i++) {
      out.push(this.args[i].copy());
    }
    return out;
  }
  operand(i: number): AlgebraicExpression {
    const out = this.args[i - 1];
    if (out === undefined) {
      return Undefined();
    } else {
      return out;
    }
  }
  /**
   * Returns a copy of this algebraic operation's
   * arguments.
   */
  argsCopy(): AlgebraicExpression[] {
    return this.args.map((x) => x.copy());
  }
}

/**
 * An algebrac expression corresponding to an n-ary sum.
 *
 * @example
 * const x = sum([sym('a'), int(2), sym('b')]) // x => a + 2 + b
 */
class Sum extends AlgebraicOp<core.sum> {
  op: core.sum = core.sum;
  copy(): Sum {
    const out = sum(this.argsCopy());
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(args: AlgebraicExpression[]) {
    super(core.sum, args);
  }
}

/**
 * Returns a new {@link Sum|sum expression}.
 */
function sum(args: AlgebraicExpression[]) {
  return new Sum(args);
}

/**
 * Type predicate. Returns true if `u` is a
 * {@link Sum|sum expression}, false otherwise.
 * If true, claims that `u` is a {@link Sum|sum expression}.
 */
function isSum(u: Expression): u is Sum {
  return u.op === core.sum;
}

/**
 * An algebraic expression corresponding to an n-ary product.
 * @example
 * const x = product([int(1), int(8), int(9)]) // x => 1 * 8 * 9
 */
class Product extends AlgebraicOp<core.product> {
  op: core.product = core.product;
  copy(): Product {
    const out = product(this.argsCopy());
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(args: AlgebraicExpression[]) {
    super(core.product, args);
  }
}

/**
 * Returns a new {@link Product|product expression}.
 */
function product(args: AlgebraicExpression[]) {
  return new Product(args);
}

/**
 * Type predicate. Returns true if `u` is a {@link Product|product expression},
 * false otherwise. If true, claims that `u` is a {@link Product|product expression}.
 */
function isProduct(u: Expression): u is Product {
  return u.op === core.product;
}

/**
 * A node corresponding to a quotient. Quotients
 * are defined as binary expressions with the operator
 * {@link core.quotient|"/"}.
 */
class Quotient extends AlgebraicOp<core.quotient> {
  op: core.quotient = core.quotient;
  args: [AlgebraicExpression, AlgebraicExpression];
  copy(): Quotient {
    const left = this.dividend.copy();
    const right = this.divisor.copy();
    const out = quotient(left, right);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(dividend: AlgebraicExpression, divisor: AlgebraicExpression) {
    super(core.quotient, [dividend, divisor]);
    this.args = [dividend, divisor];
  }
  /**
   * Returns this quotient as a {@link Product|product}.
   * @example
   * const q = quotient(1,x) // 1/x
   * const p = q.asProduct() // 1 * x^-1
   */
  asProduct(): Product {
    const left = this.divisor.copy();
    const right = power(this.dividend.copy(), int(-1));
    const out = product([left, right]);
    out.parenLevel = this.parenLevel;
    return out;
  }
  /**
   * @property The divisor of this quotient.
   * @example
   * const q = quotient(sym('x'),sym('y')) // q => x/y
   * const d = q.divisor // d => sym('x')
   */
  get divisor() {
    return (this.args[1]);
  }
  /**
   * @property The dividend of this quotient.
   * @example
   * const q = quotient(sym('x'), sym('y')) // q => x/y
   * const d = q.dividend // d => sym('y')
   */
  get dividend() {
    return (this.args[0]);
  }
}

/**
 * Returns a new {@link Quotient|quotient}.
 */
function quotient(dividend: AlgebraicExpression, divisor: AlgebraicExpression) {
  return new Quotient(dividend, divisor);
}

/**
 * Type predicate. Returns true if `u` is a {@link Quotient|quotient expression},
 * false otherwise. If true, claims that `u` is a {@link Quotient|quotient expression}.
 */
function isQuotient(u: Expression): u is Quotient {
  return u.op === core.quotient;
}

/**
 * A node corresponding to a fraction. Fractions are defined
 * as a pair of integers `[a,b]`, where `b ≠ 0`.
 */
class Fraction extends AlgebraicOp<core.fraction> {
  op: core.fraction = core.fraction;
  args: [Int, Int];
  copy(): Fraction {
    const n = this.args[0].n;
    const d = this.args[1].n;
    const out = frac(n, d);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(numerator: number, denominator: number) {
    const N = int(numerator);
    const D = int(abs(denominator));
    super(core.fraction, [N, D]);
    this.args = [N, D];
  }
  get isZero() {
    return this.numerator.n === 0;
  }
  get isOne() {
    return this.numerator.n === this.denominator.n;
  }
  get isPositive() {
    return this.numerator.n > 0;
  }
  get isNegative() {
    return this.numerator.n < 0;
  }
  /**
   * @property The numerator of this fraction (an {@link Int|integer}).
   * @example
   * frac(1,2).numerator // 1
   */
  get numerator() {
    return this.args[0];
  }
  /**
   * @property The denominator of this fraction (an {@link Int|integer}).
   * @example
   * frac(1,2).denominator // 2
   */
  get denominator() {
    return this.args[1];
  }
  /**
   * @property This fraction’s numerator and
   *           denominator in pair form.
   * @example
   * const a = frac(1,2);
   * const b = a.pair // [1,2]
   */
  get pair() {
    return tuple(this.numerator.n, this.denominator.n);
  }
}

/**
 * Type predicate. Returns true if `u` is a {@link Fraction|fraction},
 * false otherwise. If true, claims that `u` is a fraction.
 */
function isFrac(u: Expression): u is Fraction {
  return u.op === core.fraction;
}

/**
 * Returns a new {@link Fraction|fraction}.
 */
function frac(numerator: number, denominator: number) {
  return new Fraction(numerator, denominator);
}

/**
 * Simplifies the given fraction.
 */
function simplyRational(expression: Fraction | Int) {
  const f = (u: Fraction | Int) => {
    if (isInt(u)) {
      return u;
    } else {
      const n = u.numerator;
      const d = u.denominator;
      if (rem(n.n, d.n) === 0) {
        return int(quot(n.n, d.n));
      } else {
        const g = gcd(n.n, d.n);
        if (d.n > 0) {
          return frac(quot(n.n, g), quot(d.n, g));
        } else {
          return frac(quot(-n.n, g), quot(-d.n, g));
        }
      }
    }
  };
  return f(expression);
}

/**
 * Returns the numerator of the given {@link Fraction|fraction}
 * or {@link Int|integer}. If an integer is passed, returns a
 * copy of the integer.
 */
function numeratorOf(u: Fraction | Int): number {
  if (isInt(u)) {
    return u.n;
  } else {
    return u.numerator.n;
  }
}

/**
 * Returns the denominator of the given {@link Fraction|fraction}
 * or {@link Int|integer}. If an integer is passed, returns `int(1)`.
 */
function denominatorOf(u: Fraction | Int): number {
  if (isInt(u)) {
    return 1;
  } else {
    return u.denominator.n;
  }
}

/**
 * Evaluates a sum.
 *
 * @param a - The left summand.
 * @param b - The right summand.
 */
function evalSum(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n + b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      (n1 * d2) + (n2 * d1),
      d1 * d2,
    ));
  }
}

/**
 * Evaluates a difference.
 *
 * @param a - The left minuend.
 * @param b - The right minuend.
 */
function evalDiff(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n - b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      n1 * d2 - n2 * d1,
      d1 * d2,
    ));
  }
}

/**
 * Returns the reciprocal of the given
 * {@link Int|integer} or {@link Fraction|fraction}.
 */
function reciprocal(a: Int | Fraction) {
  if (isInt(a)) {
    return frac(1, a.n);
  } else {
    return frac(
      a.denominator.n,
      a.numerator.n,
    );
  }
}

/**
 * Evaluates a quotient.
 *
 * @param a - The dividend.
 * @param b - The divisor.
 */
function evalQuot(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    if (b.isZero) {
      return Undefined();
    }
    return frac(a.n, b.n);
  } else {
    return evalProduct(a, reciprocal(b));
  }
}

/**
 * Evalutes a power.
 */
function evalPower(base: Int | Fraction, exponent: Int) {
  const f = (v: Int | Fraction, n: Int): Fraction | Int | UNDEFINED => {
    if (numeratorOf(v) !== 0) {
      if (n.n > 0) {
        const s = f(v, int(n.n - 1));
        if (isUndefined(s)) {
          return s;
        }
        return evalProduct(s, v);
      } else if (n.n === 0) {
        return int(1);
      } else if (n.n === -1) {
        return simplyRational(reciprocal(v));
      } else if (n.n < -1) { // x^(-2) => 1/(x^2)
        const s = evalQuot(reciprocal(v), int(1));
        if (isUndefined(s)) return s;
        return f(s, int(-n.n));
      } else {
        return Undefined();
      }
    } else {
      if (n.n >= 1) {
        return int(0);
      } else if (n.n <= 0) {
        return Undefined();
      } else {
        return Undefined();
      }
    }
  };
  return f(base, exponent);
}

/**
 * Evaluates a product.
 */
function evalProduct(a: Int | Fraction, b: Int | Fraction) {
  if (isInt(a) && isInt(b)) {
    return int(a.n * b.n);
  } else {
    const n1 = numeratorOf(a);
    const d1 = denominatorOf(a);
    const n2 = numeratorOf(b);
    const d2 = denominatorOf(b);
    return simplyRational(frac(
      n1 * n2,
      d1 * d2,
    ));
  }
}

/**
 * Simplifies a rational number expression.
 */
function simplifyRNE(expression: AlgebraicExpression) {
  const f = (u: AlgebraicExpression): Int | Fraction | UNDEFINED => {
    if (isInt(u)) {
      return u;
    } else if (isFrac(u)) {
      if (u.denominator.isZero) {
        return Undefined();
      } else {
        return u;
      }
    } else if (u.numberOfOperands === 1) {
      const v = f(u.operand(1));
      if (isUndefined(v)) {
        return Undefined();
      } else if (isSum(u)) {
        return v;
      } else if (isDifference(u)) {
        return evalProduct(int(-1), v);
      }
    } else if (u.numberOfOperands === 2) {
      if (isSum(u) || isProduct(u) || isDifference(u) || isQuotient(u)) {
        const v = f(u.operand(1));
        if (isUndefined(v)) {
          return Undefined();
        }
        const w = f(u.operand(2));
        if (isUndefined(w)) {
          return Undefined();
        }
        if (isSum(u)) {
          return evalSum(v, w);
        } else if (isDifference(u)) {
          return evalDiff(v, w);
        } else if (isProduct(u)) {
          return evalProduct(v, w);
        } else if (isQuotient(u)) {
          return evalQuot(v, w);
        }
      } else if (isPower(u)) {
        const v = f(u.operand(1));
        if (isUndefined(v)) {
          return Undefined();
        } else {
          // @ts-ignore
          return evalPower(v, u.operand(2));
        }
      }
    }
    return Undefined();
  };
  const v = f(expression);
  if (isUndefined(v)) {
    return v;
  }
  return simplyRational(v);
}

/**
 * An algebraic expression mapping to a power.
 */
class Power extends AlgebraicOp<core.power> {
  copy(): Power {
    const b = this.base.copy();
    const e = this.base.copy();
    const out = power(b, e);
    out.parenLevel = this.parenLevel;
    return out;
  }
  op: core.power = core.power;
  args: [AlgebraicExpression, AlgebraicExpression];
  constructor(base: AlgebraicExpression, exponent: AlgebraicExpression) {
    super(core.power, [base, exponent]);
    this.args = [base, exponent];
  }
  toString(): string {
    const base = this.base.toString();
    const exponent = this.exponent.toString();
    const out = `${base}^${exponent}`;
    if (this.parenLevel !== 0) {
      return parend(out);
    } else {
      return out;
    }
  }
  /**
   * @property The base of this power.
   * @example
   * e^x // base is 'e'
   */
  get base() {
    return this.args[0];
  }
  /**
   * @property The exponent of this power.
   * @example
   * e^x // exponent is 'x'
   */
  get exponent() {
    return this.args[1];
  }
}

/**
 * Returns a new {@link Power|power expression}.
 *
 * @param base - The power expression’s base,
 *               which may be any {@link AlgebraicExpression|algebraic expression}.
 *
 * @param exponent - The power expression’s exponent,
 *                   which may be any
 *                   {@link AlgebraicExpression|algebraic expression}.
 *
 * @example
 * power(int(1), sym('x')) // maps to 1^x
 */
function power(base: AlgebraicExpression, exponent: AlgebraicExpression) {
  return new Power(base, exponent);
}

/**
 * Type guard. Returns true if `u` is a {@link Power|power expression},
 * false otherwise.
 */
function isPower(u: Expression): u is Power {
  return u.op === core.power;
}

/**
 * A node corresponding to a difference.
 */
class Difference extends AlgebraicOp<core.difference> {
  op: core.difference = core.difference;
  args: [AlgebraicExpression, AlgebraicExpression];
  copy(): Difference {
    const left = this.left.copy();
    const right = this.right.copy();
    const out = difference(left, right);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(left: AlgebraicExpression, right: AlgebraicExpression) {
    super(core.difference, [left, right]);
    this.args = [left, right];
  }
  /**
   * Returns the left minuend of this difference.
   * @example
   * a - b // left is 'a'
   */
  get left() {
    return this.args[0];
  }
  /**
   * Returns the right minuend of this difference.
   * @example
   * a - b // right is 'b'
   */
  get right() {
    return this.args[1];
  }
  /**
   * Returns this difference as a sum. I.e., where L is the lefthand minuend
   * and R is the righthand minuend:
   *
   * ~~~ts
   * L - R becomes L + (-1 * R)
   * ~~~
   */
  toSum() {
    const left = this.left;
    const right = product([int(-1), this.right]).tickParen();
    return sum([left, right]);
  }
}

/**
 * Returns an expression corresponding to the difference:
 *
 * ~~~ts
 * a - b
 * ~~~
 */
function difference(a: AlgebraicExpression, b: AlgebraicExpression) {
  return new Difference(a, b);
}

/**
 * __Type Predicate__. Returns true if `u` is {@link Difference|difference expression},
 * false otherwise.
 */
function isDifference(u: Expression): u is Difference {
  return u.op === core.difference;
}

/**
 * Returns the provided algebraic expression `u`,
 * negated. Negation is defined as a product:
 *
 * ~~~ts
 * -1 * u
 * ~~~
 */
function negate(u: AlgebraicExpression) {
  return product([int(-1), u]).tickParen();
}

/**
 * A node corresponding to the mathematical factorial.
 * The factorial is always a unary operation.
 */
class Factorial extends AlgebraicOp<core.factorial> {
  op: core.factorial = core.factorial;
  args: [AlgebraicExpression];
  copy(): Factorial {
    const arg = this.arg.copy();
    const out = factorial(arg);
    out.parenLevel = this.parenLevel;
    return out;
  }
  constructor(arg: AlgebraicExpression) {
    super(core.factorial, [arg]);
    this.args = [arg];
  }
  /**
   * Returns the argument of this factorial.
   * @example
   * x! // arg is 'x'
   */
  get arg() {
    return this.args[0];
  }
  toString(): string {
    return `${this.arg.toString()}!`;
  }
}

/**
 * Returns a new {@link Factorial|factorial}.
 */
function factorial(of: AlgebraicExpression) {
  return new Factorial(of);
}

/**
 * __Type Predicate__. Returns true if the expression `u`
 * is a {@link Factorial|factorial expression}, false
 * otherwise.
 */
function isFactorial(u: Expression): u is Factorial {
  return u.op === core.factorial;
}

/**
 * A node corresponding to any function that takes
 * arguments of type {@link AlgebraicExpression|algebraic expression}.
 */
class AlgebraicFn extends Compound {
  op: string;
  args: AlgebraicExpression[];
  copy(): AlgebraicFn {
    const out = fn(this.op, this.args.map((c) => c.copy()));
    out.parenLevel = this.parenLevel;
    return out;
  }
  operand(i: number): AlgebraicExpression {
    const out = this.args[i - 1];
    if (out === undefined) {
      return Undefined();
    } else {
      return out;
    }
  }
  constructor(op: string, args: AlgebraicExpression[]) {
    super(op, args);
    this.op = op;
    this.args = args;
  }
  toString(): string {
    const name = this.op;
    const args = this.args.map((x) => x.toString()).join(",");
    return `${name}(${args})`;
  }
}

/**
 * Returns a new set.
 */
function setof<T>(...args: T[]) {
  return new Set(args);
}

/**
 * Returns a new algebraic function.
 */
function fn(name: string, args: AlgebraicExpression[]) {
  return new AlgebraicFn(name, args);
}

/**
 * Type predicate. Returns true if the given expression `u`
 * is an {@link AlgebraicFn|algebraic function}, false
 * otherwise. If true, claims that `u` is an
 * {@link AlgebraicFn|algebraic function}.
 */
function isAlgebraicFn(u: Expression): u is AlgebraicFn {
  return u instanceof AlgebraicFn;
}

/**
 * Returns all complete subexpressions of the given
 * expression.
 */
function subex(expression: AlgebraicExpression) {
  const out: AlgebraicExpression[] = [];
  const set = setof<string>();
  const f = (u: AlgebraicExpression) => {
    if (isAtom(u)) {
      const s = u.toString();
      if (!set.has(s)) {
        out.push(u);
      }
      return null;
    } else {
      const s = u.toString();
      if (!set.has(s)) {
        out.push(u);
        u.args.forEach((x) => f(x));
        set.add(s);
      }
      return null;
    }
  };
  f(expression);
  return out;
}

/**
 * Returns true if the given `expression` does not contain the given
 * `variable`.
 */
function freeof(expression: AlgebraicExpression, variable: Sym | string) {
  const t = typeof variable === "string" ? sym(variable) : variable;
  const f = (u: AlgebraicExpression): boolean => {
    if (u.equals(t)) {
      return false;
    } else if (isAtom(u)) {
      return true;
    } else {
      let i = 1;
      while (i <= u.numberOfOperands) {
        const x = f(u.operand(i));
        if (!x) {
          return false;
        }
        i += 1;
      }
      return true;
    }
  };
  return f(expression);
}

/**
 * Returns the term of this expression.
 */
function termOf(u: Expression) {
  if (
    isSymbol(u) || isSum(u) || isPower(u) || isFactorial(u) || isAlgebraicFn(u)
  ) {
    return u;
  } else if (isProduct(u)) {
    return product(u.tail());
  } else {
    return Undefined();
  }
}

/**
 * Returns true if the given expression is a constant.
 */
function isConst(u: Expression): u is Int | Fraction | Constant<number> {
  return (
    ((u.op === core.int) ||
      (u.op === core.fraction) ||
      (u.op === core.constant)) && (
        !isUndefined(u)
      )
  );
}

/**
 * Returns the constant of the given
 * expression `u`.
 */
function constantOf(u: Expression) {
  if (
    isSymbol(u) || isSum(u) || isPower(u) || isFactorial(u) || isAlgebraicFn(u)
  ) {
    return int(1);
  } else if (isProduct(u)) {
    const head = u.head();
    if (isConst(head)) {
      return head;
    } else {
      return int(1);
    }
  } else {
    return Undefined();
  }
}

/**
 * Returns the base of the given expression `u`.
 */
function baseOf(u: Expression) {
  if (
    isSymbol(u) || isProduct(u) || isSum(u) || isFactorial(u) ||
    isAlgebraicFn(u)
  ) {
    return u;
  } else if (isPower(u)) {
    return u.base;
  } else {
    return Undefined();
  }
}

/**
 * Returns the exponent of the given expression `u`.
 */
function exponentOf(u: Expression) {
  if (
    isSymbol(u) || isProduct(u) || isSum(u) || isFactorial(u) ||
    isAlgebraicFn(u)
  ) {
    return int(1);
  } else if (isPower(u)) {
    return u.exponent;
  } else {
    return Undefined();
  }
}

/**
 * Returns true if `u` is equal to `v`,
 * false otherwise.
 */
function equals(u: Fraction | Int, v: Fraction | Int) {
  if (isInt(u) && isInt(v)) {
    return u.n === v.n;
  } else {
    const A = simplyRational(u);
    const B = simplyRational(v);
    const n1 = numeratorOf(A);
    const d1 = denominatorOf(A);
    const n2 = numeratorOf(B);
    const d2 = denominatorOf(B);
    return (
      (n1 === n2) &&
      (d1 === d2)
    );
  }
}

/**
 * Returns true if `u` is less than `v`,
 * false otherwise.
 */
function lt(u: Fraction | Int, v: Fraction | Int) {
  return lte(u, v) && !equals(u, v);
}

/**
 * Returns true if `u` is greater than `v`,
 * false otherwise.
 */
function gt(u: Fraction | Int, v: Fraction | Int) {
  return !lte(u, v);
}

/**
 * Returns true if `u` is greater than or equal to `v`,
 * false otherwise.
 */
function gte(u: Fraction | Int, v: Fraction | Int) {
  return gt(u, v) || equals(u, v);
}

/**
 * Returns true if `u` is less than or equal to `v`,
 * false otherwise.
 */
function lte(u: Fraction | Int, v: Fraction | Int): boolean {
  if (isInt(u) && isInt(v)) {
    return u.n <= v.n;
  } else {
    const A = simplyRational(u);
    const B = simplyRational(v);
    const n1 = numeratorOf(A);
    const d1 = denominatorOf(A);
    const n2 = numeratorOf(B);
    const d2 = denominatorOf(B);
    return (
      (n1 * d2) <= (n2 * d1)
    );
  }
}

/**
 * __Type Guard__. Returns true if `u` is a
 * {@link Sum|sum} or {@link Product|product},
 * false otherwise.
 */
function isSumlike(u: Expression): u is Sum | Product {
  return (isSum(u)) || isProduct(u);
}

/**
 * __Type Guard__. Returns true if `u` is an
 * {@link Int|integer} or {@link Fraction|fraction},
 * false otherwise.
 */
function isNumeric(u: Expression): u is Int | Fraction {
  return isInt(u) || isFrac(u);
}

/**
 * Returns true if `expression1` precedes `expression2`,
 * false otherwise.
 */
function precedes(
  expression1: AlgebraicExpression,
  expression2: AlgebraicExpression,
) {
  /**
   * Numeric ordering.
   */
  const O1 = (u: Fraction | Int, v: Fraction | Int) => (lt(u, v));

  /**
   * Lexicographic ordering.
   */
  const O2 = (u: Sym, v: Sym) => (u.s < v.s);

  /**
   * Summand ordering.
   */
  const O3 = (u: Sum | Product, v: Sum | Product): boolean => {
    if (!(u.last().equals(v.last()))) {
      return order(u.last(), v.last());
    }
    const m = u.numberOfOperands;
    const n = v.numberOfOperands;
    const k = min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k; j++) {
        const o1 = u.operand(m - j);
        const o2 = v.operand(n - j);
        if (!o1.equals(o2)) {
          return order(o1, o2);
        }
      }
    }
    return m < n;
  };

  /**
   * Power ordering.
   */
  const O4 = (u: Power, v: Power): boolean => {
    const uBase = baseOf(u);
    const vBase = baseOf(v);
    if (!uBase.equals(vBase)) {
      return order(uBase, vBase);
    } else {
      const uExponent = exponentOf(u);
      const vExponent = exponentOf(v);
      return order(uExponent, vExponent);
    }
  };

  /**
   * Factorial ordering.
   */
  const O5 = (u: Factorial, v: Factorial): boolean => {
    const uArg = u.arg;
    const vArg = v.arg;
    return order(uArg, vArg);
  };

  /**
   * Function ordering.
   */
  const O6 = (u: AlgebraicFn, v: AlgebraicFn): boolean => {
    if (u.op !== v.op) {
      return u.op < v.op; // lexicographic
    } else {
      const uOp1 = u.operand(1);
      const uOp2 = u.operand(1);
      if (!uOp1.equals(uOp2)) {
        return order(uOp1, uOp2);
      }
    }
    const m = u.numberOfOperands;
    const n = v.numberOfOperands;
    const k = min(n, m) - 1;
    if (1 <= k) {
      for (let j = 0; j <= k - 1; j++) {
        const o1 = u.operand(m - j);
        const o2 = u.operand(n - j);
        if (!o1.equals(o2)) {
          return order(o1, o2);
        }
      }
    }
    return m < n;
  };
  // O7 omitted - if u is a numeric, it shall always be precedent.
  const O8 = (u: Product, v: Power | Sum | Factorial | AlgebraicFn | Sym) => {
    if (!u.equals(v)) {
      return order(u.last(), v);
    } else {
      return true;
    }
  };
  const O9 = (u: Power, v: Sum | Factorial | AlgebraicFn | Sym) => {
    return order(u, power(v, int(1)));
  };
  const O10 = (u: Sum, v: Factorial | AlgebraicFn | Sym) => {
    if (!u.equals(v)) {
      return order(u, sum([int(0), v]));
    } else {
      return true;
    }
  };
  const O11 = (u: Factorial, v: AlgebraicFn | Sym) => {
    const o1 = u.operand(1);
    if (o1.equals(v)) {
      return false;
    } else {
      return order(u, factorial(v));
    }
  };
  const O12 = (u: AlgebraicFn, v: Sym) => {
    if (u.op !== v.s) {
      return false;
    } else {
      return order(sym(u.op), v);
    }
  };
  // deno-fmt-ignore
  const order = (u: AlgebraicExpression, v: AlgebraicExpression): boolean => {
    if (isNumeric(u) && isNumeric(v)) return O1(u, v);
    if (isSymbol(u) && isSymbol(v)) return O2(u, v);
    if (isSumlike(u) && isSumlike(v)) return O3(u, v);
    if (isPower(u) && isPower(v)) return O4(u, v);
    if (isFactorial(u) && isFactorial(v)) return O5(u, v);
    if (isAlgebraicFn(u) && isAlgebraicFn(v)) return O6(u, v);
    if (isNumeric(u)) return true; // rule O7 -- numerics are always precedent.
    if (isProduct(u) && (isPower(v) || isSum(v) || isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O8(u, v);
    if (isPower(u) && (isSum(v) || isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O9(u, v);
    if (isSum(u) && ( isFactorial(v) || isAlgebraicFn(v) || isSymbol(v))) return O10(u, v);
    if (isFactorial(u) && ( isAlgebraicFn(v) || isSymbol(v))) return O11(u, v);
    if (isAlgebraicFn(u) && isSymbol(v)) return O12(u, v);
    return u.toString() < v.toString();
  };
  return order(expression1, expression2);
}

/**
 * Sorts the given list of algebraic expressions.
 */
function sortex(expressions: AlgebraicExpression[]) {
  const out = [];
  for (let i = 0; i < expressions.length; i++) {
    out.push(expressions[i]);
  }
  return out.sort((a, b) => precedes(a, b) ? -1 : 1);
}

/**
 * Returns true if the given list of algebraic expressions
 * contains the symbol {@link UNDEFINED|Undefined}.
 */
function hasUndefined(args: AlgebraicExpression[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isUndefined(arg)) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the given list of algebraic
 * expressions contains the {@link Int|integer} `0`.
 */
function hasZero(args: AlgebraicExpression[]) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (isConst(arg) && arg.isZero) {
      return true;
    }
  }
  return false;
}

/**
 * Applies the given function `f` to the given `expression`,
 * which is either an {@link AlgebraicOp|algebraic operation}
 * or an {@link AlgebraicFn|algebraic function}.
 *
 * @example
 *
 * // the function 'f'
 * const square = (
 *   expr: AlgebraicExpression
 * ) => power(expr, int(2));
 *
 * // the expression
 * const s = sum([sym("a"), sym("b"), sym("c")]);
 *
 * console.log(s.toString()) // a + b + c
 *
 * const x = argMap(square, s);
 *
 * console.log(x.toString()); // a^2 + b^2 + c^2
 */
function argMap<T extends (AlgebraicOp | AlgebraicFn)>(
  F: (x: AlgebraicExpression) => AlgebraicExpression,
  expression: T,
): T {
  const out = expression.args.map(F);
  const op = expression.copy();
  op.args = out;
  return op as T;
}

/**
 * Applies the given callback `G` to each argument expression of
 * `args`, with the operator `op`.
 *
 * @example
 * const G = (
 *   args: AlgebraicExpression[]
 *  ) => sum([
 *   power(args[0], int(2)),
 *   power(args[1], int(3)),
 *   power(args[2], int(4))
 * ]);
 *
 * const x = opMap(G,
 *  sum([sym("a"), sym("b")]),
 *  [sym("c"), sym("d")]
 * );
 *
 * print(x.toString()); // ((a^2)+(c^3)+(d^4))+((b^2)+(c^3)+(d^4))
 */
function opMap<T extends (AlgebraicOp | AlgebraicFn)>(
  G: (args: AlgebraicExpression[]) => AlgebraicExpression,
  op: T,
  args: AlgebraicExpression[],
) {
  const operands: AlgebraicExpression[] = [];
  op.args.forEach((arg) => {
    operands.push(G([arg, ...args]));
  });
  switch (op.op) {
    case core.factorial: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      return factorial(a) as any as T;
    }
    case core.sum:
      return sum(operands) as any as T;
    case core.product:
      return product(operands) as any as T;
    case core.difference: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return difference(a, b) as any as T;
    }
    case core.power: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return power(a, b) as any as T;
    }
    case core.quotient: {
      let a = operands[0] !== undefined ? operands[0] : Undefined();
      let b = operands[1] !== undefined ? operands[1] : Undefined();
      return quotient(a, b) as any as T;
    }
    default: {
      return fn(op.op, operands) as any as T;
    }
  }
}

function simplify(expression: AlgebraicExpression) {
  const simplify_function = (expr: AlgebraicFn): AlgebraicExpression => {
    throw new Error(`simplify_function not implemented`);
  };
  const simplify_factorial = (expr: Factorial): AlgebraicExpression => {
    throw new Error(`simplify_factorial not implemented`);
  };
  const simplify_difference = (expr: Difference): AlgebraicExpression => {
    throw new Error(`simplify_difference not implemented`);
  };
  const simplify_quotient = (expr: Quotient): AlgebraicExpression => {
    throw new Error(`simplify_quotient not implemented`);
  };
  const simplify_sum = (expr: Sum): AlgebraicExpression => {
    throw new Error(`simplify_sum not implemented`);
  };
  const simplify_product = (expr: Product): AlgebraicExpression => {
    throw new Error(`simplify_product not implemented`);
  };
  
  /**
   * Simpifies a power expression.
   */
  const simplify_power = (u: Power): AlgebraicExpression => {
    const simplify_integer_power = (v:AlgebraicExpression, n:Int): AlgebraicExpression => {
      /**
       * __SINTPOW-1__. We handle the simple case where it’s a number (or fraction)
       * raised to an integer.
       */
      if (isNumeric(v)) {
        return simplifyRNE(power(v,n));
      }
      throw new Error(`simplify_integer_power not implemented.`)
    }
    /**
     * We start by supposing `u = v^w`. Therefore, `v` is the base,
     * and `w` is the exponent.
     */
    const spow = (v: AlgebraicExpression, w: AlgebraicExpression) => {
      /**
       * We handle the simplest case:
       * 
       * __SPOW-1__. If v is undefined and w is undefined, return undefined.
       */
      if (isUndefined(v) && isUndefined(w)) {
        return Undefined();
      }

      /**
       * Next, the case where `0^w`. This should return 0. But, mathematically,
       * `0^0` is undefined. Likewise, `0^-n`, where `n` is a positive integer, 
       * is always undefined (since this would yield 1/0^n = 1/0).
       * 
       * __SPOW-2__. If `v = 0`, then:
       * 1. If `w > 0` return `0`.
       * 2. Else, return `Undefined`.
       */
      if (isNumeric(v) && v.isZero) {
        if (isNumeric(w) && w.isPositive) {
          return int(0);
        } else {
          return Undefined();
        }
      }
      
      /**
       * Now we handle another simple case: `1^w.`
       * 
       * __SPOW-3__. If `v = 1`, then return `1`.
       */
      if (isNumeric(v) && v.isOne) {
        return int(1);
      }
      
      /**
       * Now we handle the case where `w` is some integer.
       * E.g., (a + b)^2.
       * 
       * __SPOW-4__.
       */
      if (isInt(w)) {
        return simplify_integer_power(v,w);
      }
      
      /**
       * None of the 4 previous rules apply, so we return `u`.
       */
      return u;

    };
    return spow(u.base, u.exponent);
  };
  const automatic_simplify = (u: AlgebraicExpression): AlgebraicExpression => {
    if (u instanceof Atom) {
      return u;
    } else if (isFrac(u)) {
      return simplyRational(u);
    } else {
      const v = argMap(automatic_simplify, u);
      if (isPower(v)) {
        return simplify_power(v);
      } else if (isProduct(v)) {
        return simplify_product(v);
      } else if (isSum(v)) {
        return simplify_sum(v);
      } else if (isQuotient(v)) {
        return simplify_quotient(v);
      } else if (isDifference(v)) {
        return simplify_difference(v);
      } else if (isFactorial(v)) {
        return simplify_factorial(v);
      } else if (isAlgebraicFn(v)) {
        return simplify_function(v);
      } else {
        return Undefined();
      }
    }
  };
}
