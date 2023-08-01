const { floor, abs, min, max, PI, E } = Math;

/**
 * Utility function for printing the AST.
 */
export function treeof<T extends Object>(
  Obj: T,
  cbfn?: (node: any) => void,
) {
  const prefix = (key: keyof T, last: boolean) => {
    let str = last ? "└" : "├";
    if (key) str += "─ ";
    else str += "──┐";
    return str;
  };
  const getKeys = (obj: T) => {
    const keys: (keyof T)[] = [];
    for (const branch in obj) {
      if (!obj.hasOwnProperty(branch) || typeof obj[branch] === "function") {
        continue;
      }
      keys.push(branch);
    }
    return keys;
  };
  const grow = (
    key: keyof T,
    root: any,
    last: boolean,
    prevstack: ([T, boolean])[],
    cb: (str: string) => any,
  ) => {
    cbfn && cbfn(root);
    let line = "";
    let index = 0;
    let lastKey = false;
    let circ = false;
    let stack = prevstack.slice(0);
    if (stack.push([root, last]) && stack.length > 0) {
      prevstack.forEach(function (lastState, idx) {
        if (idx > 0) line += (lastState[1] ? " " : "│") + "  ";
        if (!circ && lastState[0] === root) circ = true;
      });
      let k = "";
      if (root instanceof ASTNode) {
        root.kind = nodekind[root.kind] as any;
      }
      if (
        root instanceof AlgebraicBinaryExpr || root instanceof RelationalExpr ||
        root instanceof LogicalBinaryExpr || root instanceof LogicalUnaryExpr ||
        root instanceof AlgebraicUnaryExpr
      ) {
        root.op = root.op.lexeme as any;
      }
      if (root instanceof Token) {
        root.type = tt[root.type];
      }
      line += prefix(key, last) + key.toString();
      if (typeof root !== "object") line += ": " + root;
      circ && (line += " (circular ref.)");
      cb(line);
    }
    if (!circ && typeof root === "object") {
      const keys = getKeys(root);
      keys.forEach((branch) => {
        lastKey = ++index === keys.length;
        grow(branch, root[branch], lastKey, stack, cb);
      });
    }
  };
  let output = "";
  const obj = Object.assign({}, Obj);
  grow(
    "." as keyof T,
    obj,
    false,
    [],
    (line: string) => (output += line + "\n"),
  );
  return output;
}

// § - Either Type
/**
 * At the parsing stage, all parsed node results are kept
 * in an `Either` type (either an AST node) or an Err (error)
 * object. We want to avoid throwing as much as possible for
 * optimal parsing.
 */
type Either<A, B> = Left<A> | Right<B>;

/**
 * A `Left` type indicates failure.
 */
class Left<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<A>(f: (x: never) => A): Either<T, never> {
    return this as any;
  }
  isLeft(): this is Left<T> {
    return true;
  }
  isRight(): this is never {
    return false;
  }
  chain<X, S>(f: (x: never) => Either<X, S>): Left<T> {
    return this;
  }
  read<K>(value: K): K {
    return value;
  }
  flatten(): Left<T> {
    return this;
  }
  unwrap() {
    return this.value;
  }
  ap<B, E>(f: Either<T, E>): Either<never, B> {
    return this as any;
  }
}

/**
 * A right type indicates success.
 */
class Right<T> {
  private value: T;
  constructor(value: T) {
    this.value = value;
  }
  map<X>(f: (x: T) => X): Either<never, X> {
    return new Right(f(this.value));
  }
  isLeft(): this is never {
    return false;
  }
  isRight(): this is Right<T> {
    return true;
  }
  chain<N, X>(f: (x: T) => Either<N, X>): Either<never, X> {
    return f(this.value) as Either<never, X>;
  }
  flatten(): Right<(T extends Right<(infer T)> ? T : never)> {
    return ((this.value instanceof Right ||
        this.value instanceof Left)
      ? this.value
      : this) as Right<(T extends Right<(infer T)> ? T : never)>;
  }
  read<K>(_: K): T {
    return this.value;
  }
  unwrap() {
    return this.value;
  }
  ap<B, E>(f: Either<E, (x: T) => B>): Either<never, B> {
    if (f.isLeft()) return f as any as Right<B>;
    return this.map(f.value);
  }
}

/**
 * Returns a new left.
 */
const left = <T>(x: T): Left<T> => new Left(x);

/**
 * Returns a new right.
 */
const right = <T>(x: T): Right<T> => new Right(x);

/**
 * Utility method - Logs to the console.
 */
const print = console.log;
const isString = (x: any): x is string => (typeof x === "string");
const isNumber = (x: any): x is number => (typeof x === "number");
const isArray = (x: any): x is any[] => (Array.isArray(x));
const isBoolean = (x: any): x is boolean => (typeof x === "boolean");
const isBigInt = (x: any): x is bigint => (typeof x === "bigint");
const MAX_INT = Number.MAX_SAFE_INTEGER;

type ErrorType =
  | "lexical-error"
  | "syntax-error"
  | "type-error"
  | "algebraic-error";

class Err extends Error {
  message: string;
  errorType: ErrorType;
  phase: string;
  line: number;
  column: number;
  constructor(
    message: string,
    errorType: ErrorType,
    phase: string,
    line: number,
    column: number,
  ) {
    const msg = message;
    super(msg);
    this.message = msg;
    this.errorType = errorType;
    this.phase = phase;
    this.line = line;
    this.column = column;
  }
  report() {
    return (`While ${this.phase}, a ${this.errorType} occurred on line ${this.line}, column ${this.column}. From the module: “${this.message}”`);
  }
}

function algebraError(
  message: string,
  phase: string,
  line: number,
  column: number,
) {
  return new Err(message, "algebraic-error", phase, line, column);
}

enum nodekind {
  int,
  float,
  rational,
  big_number,
  big_rational,
  numeric_constant,
  tuple_expression,
  vector_expression,
  matrix_expression,
  nil,
  bool,
  string,
  assign,
  algebraic_infix,
  variable,
  logical_infix,
  relation,
  call,
  native_call,
  algebraic_unary,
  logical_unary,
  block_statement,
  expression_statement,
  function_declaration,
  branching_statement,
  print_statement,
  return_statement,
  variable_declaration,
  loop_statement,
}

interface Visitor<T> {
  integer(node: Integer): T;
  numericConstant(node: NumericConstant): T;
  bigNumber(node: BigNumber): T;
  rational(node: Rational): T;
  bigRational(node: BigRational): T;
  float(node: Float): T;
  bool(node: Bool): T;
  tupleExpr(node: TupleExpr): T;
  string(node: StringLiteral): T;
  nil(node: Nil): T;
  variable(node: Variable): T;
  assignExpr(node: AssignExpr): T;
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): T;
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): T;
  logicalBinaryExpr(node: LogicalBinaryExpr): T;
  logicalUnaryExpr(node: LogicalUnaryExpr): T;
  relationalExpr(node: RelationalExpr): T;
  callExpr(node: CallExpr): T;
  nativeCall(node: NativeCall): T;
  groupExpr(node: GroupExpr): T;
  blockStmt(node: BlockStmt): T;
  exprStmt(node: ExprStmt): T;
  fnStmt(node: FnStmt): T;
  ifStmt(node: IfStmt): T;
  printStmt(node: PrintStmt): T;
  returnStmt(node: ReturnStmt): T;
  letStmt(node: LetStmt): T;
  whileStmt(node: WhileStmt): T;
}

abstract class ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  kind: nodekind;
  constructor(kind: nodekind) {
    this.kind = kind;
  }
  abstract isStatement(): this is Statement;
  abstract isExpr(): this is Expr;
}

abstract class Statement extends ASTNode {
  isStatement(): this is Statement {
    return true;
  }
  isExpr(): this is Expr {
    return false;
  }
}

class BlockStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.blockStmt(this);
  }
  statements: Statement[];
  loc: Location;
  constructor(statements: Statement[], loc: Location) {
    super(nodekind.block_statement);
    this.statements = statements;
    this.loc = loc;
  }
}

function block(statements: Statement[], loc: Location) {
  return new BlockStmt(statements, loc);
}

class ExprStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.exprStmt(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(nodekind.expression_statement);
    this.expression = expression;
  }
}

function exprStmt(expression: Expr) {
  return new ExprStmt(expression);
}

class FnStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fnStmt(this);
  }
  name: Token<tt.variable>;
  params: Token<tt.variable>[];
  body: Statement;
  constructor(
    name: Token<tt.variable>,
    params: Token<tt.variable>[],
    body: Statement,
  ) {
    super(nodekind.function_declaration);
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

/**
 * Returns a new {@link FunctionStmt|function declaration statement}.
 */
function functionStmt(
  name: Token<tt.variable>,
  params: Token<tt.variable>[],
  body: Statement,
) {
  return new FnStmt(name, params, body);
}

class IfStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ifStmt(this);
  }
  condition: Expr;
  then: Statement;
  alt: Statement;
  constructor(condition: Expr, then: Statement, alt: Statement) {
    super(nodekind.branching_statement);
    this.condition = condition;
    this.then = then;
    this.alt = alt;
  }
}
/**
 * Returns a new {@link IfStmt|if-statement}.
 */
function ifStmt(condition: Expr, then: Statement, alt: Statement) {
  return new IfStmt(condition, then, alt);
}

class PrintStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.printStmt(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(nodekind.print_statement);
    this.expression = expression;
  }
}

/**
 * Returns a new {@link PrintStmt|print-statement}.
 */
function printStmt(expression: Expr) {
  return new PrintStmt(expression);
}

class ReturnStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.returnStmt(this);
  }
  loc: Location;
  value: Expr;
  constructor(value: Expr, loc: Location) {
    super(nodekind.return_statement);
    this.value = value;
    this.loc = loc;
  }
}

/**
 * Returns a new {@link ReturnStmt|return-statement}.
 */
function returnStmt(value: Expr, loc: Location) {
  return new ReturnStmt(value, loc);
}

class LetStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.letStmt(this);
  }
  name: Token<tt.variable>;
  value: Expr;
  constructor(name: Token<tt.variable>, value: Expr) {
    super(nodekind.variable_declaration);
    this.name = name;
    this.value = value;
  }
}
function letStmt(name: Token<tt.variable>, value: Expr) {
  return new LetStmt(name, value);
}

class WhileStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.whileStmt(this);
  }
  condition: Expr;
  body: Statement;
  constructor(condition: Expr, body: Statement) {
    super(nodekind.loop_statement);
    this.condition = condition;
    this.body = body;
  }
}
/**
 * Returns a new {@link WhileStmt|while-statement}.
 */
function whileStmt(condition: Expr, body: Statement) {
  return new WhileStmt(condition, body);
}

abstract class Expr extends ASTNode {
  isStatement(): this is Statement {
    return false;
  }
  isExpr(): this is Expr {
    return true;
  }
}
function isExpr(e: ASTNode): e is Expr {
  return e instanceof Expr;
}

class TupleExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tupleExpr(this);
  }
  elements: Expr[];
  loc: Location;
  constructor(elements: Expr[], loc: Location) {
    super(nodekind.tuple_expression);
    this.elements = elements;
    this.loc = loc;
  }
}
function tupleExpr(elements: Expr[], loc: Location) {
  return new TupleExpr(elements, loc);
}

class BigNumber extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bigNumber(this);
  }
  value: bigint;
  constructor(value: bigint) {
    super(nodekind.big_number);
    this.value = value;
  }
}
/**
 * Returns a new {@link BigNumber}.
 */
function bigNumber(value: bigint) {
  return new BigNumber(value);
}

class BigRational extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bigRational(this);
  }
  N: bigint;
  D: bigint;
  constructor(N: bigint, D: bigint) {
    super(nodekind.big_rational);
    this.N = N;
    this.D = D;
  }
}
function bigRational(N: bigint, D: bigint) {
  return new BigRational(N, D);
}

class AssignExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assignExpr(this);
  }
  name: Token;
  value: Expr;
  constructor(name: Token, value: Expr) {
    super(nodekind.assign);
    this.name = name;
    this.value = value;
  }
}

class NativeCall extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nativeCall(this);
  }
  name: NativeFn;
  loc: Location;
  args: Expr[];
  constructor(name: NativeFn, args: Expr[], loc: Location) {
    super(nodekind.native_call);
    this.name = name;
    this.args = args;
    this.loc = loc;
  }
}
/**
 * Returns a new {@link NativeCall|native call function}.
 */
function nativeCall(name: NativeFn, args: Expr[], loc: Location) {
  return new NativeCall(name, args, loc);
}

/**
 * Returns a new {@link AssignExpr|assignment expression}.
 */
function assign(name: Token, value: Expr) {
  return new AssignExpr(name, value);
}

type AlgebraicUnaryOperator =
  | tt.plus
  | tt.minus
  | tt.bang;

class AlgebraicUnaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicUnaryExpr(this);
  }
  op: Token<AlgebraicUnaryOperator>;
  arg: Expr;
  constructor(op: Token<AlgebraicUnaryOperator>, arg: Expr) {
    super(nodekind.algebraic_unary);
    this.op = op;
    this.arg = arg;
  }
}

/**
 * Returns a new algebraic unary expression.
 */
function algebraicUnary(op: Token<AlgebraicUnaryOperator>, arg: Expr) {
  return new AlgebraicUnaryExpr(op, arg);
}

type LogicalUnaryOperator = tt.not;
class LogicalUnaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicalUnaryExpr(this);
  }
  op: Token<LogicalUnaryOperator>;
  arg: Expr;
  constructor(op: Token<LogicalUnaryOperator>, arg: Expr) {
    super(nodekind.logical_unary);
    this.op = op;
    this.arg = arg;
  }
}

/**
 * Returns a new {@link LogicalUnaryExpr|logical unary expression}.
 */
function logicalUnary(op: Token<LogicalUnaryOperator>, arg: Expr) {
  return new LogicalUnaryExpr(op, arg);
}

type ArithmeticOperator =
  | tt.plus
  | tt.star
  | tt.caret
  | tt.slash
  | tt.minus
  | tt.rem
  | tt.mod
  | tt.percent
  | tt.div;

class AlgebraicBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicBinaryExpr(this);
  }
  left: Expr;
  op: Token<ArithmeticOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<ArithmeticOperator>, right: Expr) {
    super(nodekind.algebraic_infix);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/**
 * Returns a new {@link AlgebraicBinaryExpr|binary expression}.
 */
function binex(left: Expr, op: Token<ArithmeticOperator>, right: Expr) {
  return new AlgebraicBinaryExpr(left, op, right);
}

class CallExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.callExpr(this);
  }
  callee: Expr;
  loc: Location;
  args: Expr[];
  constructor(callee: Expr, args: Expr[], loc: Location) {
    super(nodekind.call);
    this.callee = callee;
    this.loc = loc;
    this.args = args;
  }
  get line() {
    return this.loc.line;
  }
  get column() {
    return this.loc.column;
  }
}

/**
 * Returns a new {@link CallExpr|call expression}.
 */
function call(callee: Expr, args: Expr[], loc: Location) {
  return new CallExpr(callee, args, loc);
}

class GroupExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.groupExpr(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(expression.kind);
    this.expression = expression;
  }
}

/**
 * Returns a new {@link GroupExpr|group expression}.
 */
function grouped(expression: Expr) {
  return new GroupExpr(expression);
}

class Nil extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }
  value: null;
  constructor() {
    super(nodekind.nil);
    this.value = null;
  }
}
function nil() {
  return new Nil();
}

class Rational extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.rational(this);
  }
  n: number;
  d: number;
  constructor(n: number, d: number) {
    super(nodekind.rational);
    this.n = n;
    this.d = d;
  }
}
function rational(n: number, d: number) {
  return new Rational(n, d);
}

type CoreConstant = "NAN" | "Inf" | "pi" | "e";

class NumericConstant extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.numericConstant(this);
  }
  value: number;
  sym: CoreConstant;
  constructor(value: number, sym: CoreConstant) {
    super(nodekind.numeric_constant);
    this.value = value;
    this.sym = sym;
  }
}
function numericConstant(value: number, sym: CoreConstant) {
  return new NumericConstant(value, sym);
}

class Integer extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.integer(this);
  }
  value: number;
  constructor(value: number) {
    super(nodekind.int);
    this.value = value;
  }
}

/**
 * Returns a new {@link Integer|integer node}.
 */
function integer(n: number) {
  return new Integer(n);
}

class Float extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.float(this);
  }
  value: number;
  constructor(value: number) {
    super(nodekind.float);
    this.value = value;
  }
}

/**
 * Returns a new {@link Float|float node}.
 */
function float(n: number) {
  return new Float(n);
}

class Bool extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }
  value: boolean;
  constructor(value: boolean) {
    super(nodekind.bool);
    this.value = value;
  }
}

/**
 * Returns a new {@link Bool|boolean node}.
 */
function bool(value: boolean) {
  return new Bool(value);
}

class StringLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.string(this);
  }
  value: string;
  constructor(value: string) {
    super(nodekind.string);
    this.value = value;
  }
}

/**
 * Returns a new {@link StringLiteral|string literal node}.
 */
function string(value: string) {
  return new StringLiteral(value);
}

class Variable extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.variable(this);
  }
  name: Token<tt.variable>;
  constructor(name: Token<tt.variable>) {
    super(nodekind.variable);
    this.name = name;
  }
}
function isVariable(node: ASTNode): node is Variable {
  return node.kind === nodekind.variable;
}
/**
 * Returns a new {@link Variable|variable node}.
 */
function variable(name: Token<tt.variable>) {
  return new Variable(name);
}

type BinaryLogicalOperator =
  | tt.and
  | tt.nand
  | tt.nor
  | tt.xnor
  | tt.xor
  | tt.or;

/**
 * A node corresponding to a logical binary expression.
 * That is, an expression of the form:
 * ~~~
 * <expr> <logical-operator> <expr>
 * ~~~
 * where `<logical-operator>` is a {@link BinaryLogicalOperator|binary logical operator}:
 *
 * 1. {@link tt.and|and},
 * 2. {@link tt.nand|nand},
 * 3. {@link tt.nor|nor},
 * 4. {@link tt.or|or},
 * 5. {@link tt.xnor|xnor},
 * 6. {@link tt.xor|xor},
 */
class LogicalBinaryExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicalBinaryExpr(this);
  }
  left: Expr;
  op: Token<BinaryLogicalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BinaryLogicalOperator>, right: Expr) {
    super(nodekind.logical_infix);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/**
 * Returns a new {@link LogicalBinaryExpr|logical binary expression}.
 */
function logicalBinex(
  left: Expr,
  op: Token<BinaryLogicalOperator>,
  right: Expr,
) {
  return new LogicalBinaryExpr(left, op, right);
}

type RelationalOperator =
  | tt.lt
  | tt.gt
  | tt.deq
  | tt.neq
  | tt.geq
  | tt.leq;

class RelationalExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relationalExpr(this);
  }
  left: Expr;
  op: Token<RelationalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<RelationalOperator>, right: Expr) {
    super(nodekind.relation);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

/**
 * Returns a new {@link RelationalExpr|relational expression}.
 */
function relation(left: Expr, op: Token<RelationalOperator>, right: Expr) {
  return new RelationalExpr(left, op, right);
}

/**
 * Replaces all newline characters with a space.
 */
function tidy(s: string) {
  return s.replaceAll("\n", " ");
}

/**
 * Returns a new lexical error.
 */
function lexicalError(
  message: string,
  phase: string,
  line: number,
  column: number,
) {
  return new Err(message, "lexical-error", phase, line, column);
}

/**
 * Returns a new syntax error.
 */
function syntaxError(
  message: string,
  phase: string,
  line: number,
  column: number,
) {
  return new Err(message, "syntax-error", phase, line, column);
}

/**
 * Utility function for zipping lists.
 */
function zip<A extends any[], B extends any[]>(
  array1: A,
  array2: B,
): ([A[number], B[number]])[] {
  return (
    array1.reduce((acc, curr, ind): ([A[number], B[number]])[] => {
      acc.push([curr, array2[ind]]);
      return acc;
    }, [])
  ).filter(([a, b]: [A[number], B[number]]) =>
    a !== undefined && b !== undefined
  );
}

/**
 * Returns `a rem b` (the signed remainder).
 */
function rem(a: number, b: number) {
  return (a % b);
}

/**
 * Returns `a mod b` (the unsigned remainder).
 */
function mod(a: number, b: number) {
  return (
    ((a % b) + b) % b
  );
}

/**
 * Returns the integer quotient of `a` and `b`.
 */
function quot(a: number, b: number) {
  return (floor(a / b));
}

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

enum klass {
  atom,
  compound,
}

interface ExpressionVisitor<T> {
  int(node: Int): T;
  real(node: Real): T;
  sym(node: Sym): T;
  constant(node: Constant): T;
  sum(node: Sum): T;
  product(node: Product): T;
  quotient(node: Quotient): T;
  fraction(node: Fraction): T;
  power(node: Power): T;
  difference(node: Difference): T;
  factorial(node: Factorial): T;
  algebraicFn(node: AlgebraicFn): T;
}

abstract class Expression<A extends string = string> {
  abstract accept<T>(visitor: ExpressionVisitor<T>): T;
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

  hasParens() {
    return this.parenLevel !== 0;
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
  set args(args: AlgebraicExpression[]) {}
  get args(): AlgebraicExpression[] {
    return [];
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.int(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.real(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sym(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.constant(this);
  }
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
function Undefined(): UNDEFINED {
  return new Constant(core.undefined, null);
}

type UNDEFINED = Constant<null, core.undefined>;

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
  | Real
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.sum(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.product(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.quotient(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.fraction(this);
  }
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
function simplify_RNE(expression: AlgebraicExpression) {
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.power(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.difference(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.factorial(this);
  }
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
  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.algebraicFn(this);
  }
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
 * From a list of strings, numbers, number pairs, and algebraic
 * expressions, returns a list comprised entirely of
 * algebraic expressions.
 */
function exprs(
  args: (string | number | AlgebraicExpression)[],
) {
  const out: AlgebraicExpression[] = [];
  for (let i = 0; i < args.length; i++) {
    const x = args[i];
    if (isNumber(x)) {
      if (Number.isInteger(x)) {
        out.push(int(x));
      } else {
        out.push(real(x));
      }
    } else if (isString(x)) {
      out.push(sym(x));
    } else {
      out.push(x);
    }
  }
  return out;
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
    return order(sym(u.op), v);
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
  const out: AlgebraicExpression[] = [];
  if (expressions.length === 0) {
    return out;
  }
  if (expressions.length === 1) {
    return [expressions[0]];
  }
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

/**
 * Returns a new list with `expression` placed at the beginning of `list`.
 */
function adjoin(expression: AlgebraicExpression, list: AlgebraicExpression[]) {
  const out: AlgebraicExpression[] = [expression];
  for (let i = 0; i < list.length; i++) {
    out.push(list[i]);
  }
  return out;
}

/**
 * Returns the given expression list without
 * the first member.
 */
function rest(expressions: AlgebraicExpression[]): AlgebraicExpression[] {
  const out: AlgebraicExpression[] = [];
  for (let i = 1; i < expressions.length; i++) {
    out.push(expressions[i]);
  }
  return out;
}

function factorialize(num: number) {
  if (num === 0 || num === 1) {
    return 1;
  }
  for (var i = num - 1; i >= 1; i--) {
    num *= i;
  }
  return num;
}

function simplify(expression: AlgebraicExpression) {
  const simplify_function = (expr: AlgebraicFn): AlgebraicExpression => {
    return expr;
  };

  const simplify_factorial = (expr: Factorial): AlgebraicExpression => {
    const arg = expr.arg;
    if (isUndefined(arg)) {
      return arg;
    }
    const newarg = automatic_simplify(arg);
    if (isInt(newarg)) {
      const out = factorialize(newarg.n);
      return int(out);
    }
    return factorial(newarg);
  };

  const simplify_difference = (expr: Difference): AlgebraicExpression => {
    const lhs = expr.left;
    const right = expr.right;
    const rhs = simplify_product(product([int(-1), right]));
    return simplify_sum(sum([lhs, rhs]));
  };

  const simplify_quotient = (expr: Quotient): AlgebraicExpression => {
    const u = expr.dividend;
    const v = expr.divisor;
    const rhs = simplify_power(power(v, int(-1)));
    return simplify_product(product([u, rhs]));
  };

  const simplify_sum = (expr: Sum): AlgebraicExpression => {
    const merge_sums = (
      a: AlgebraicExpression[],
      b: AlgebraicExpression[],
    ): AlgebraicExpression[] => {
      const p = sortex(a);
      const q = sortex(b);
      if (q.length === 0) {
        return p;
      } else if (p.length === 0) {
        return q;
      }
      const p1 = p[0];
      const q1 = q[0];
      const h = simplify_sum_rec([p1, q1]);
      if (h.length === 0) {
        return merge_sums(rest(p), rest(q));
      } else if (h.length === 1) {
        return adjoin(h[0], merge_sums(rest(p), rest(q)));
      } else if (h.length === 2 && (h[0].equals(p1) && h[1].equals(q1))) {
        return adjoin(p1, merge_sums(rest(p), q));
      } else {
        return adjoin(q1, merge_sums(p, rest(q)));
      }
    };
    // deno-fmt-ignore
    const simplify_sum_rec = (L: AlgebraicExpression[]): AlgebraicExpression[] => {
      if (L.length === 2 && (!isSum(L[0])) && (!isSum(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];

        /**
         * __SPSMREC-1.1__
         */
        if (isConst(u1) && isConst(u2)) {
          const P = simplify_RNE(sum([u1, u2]));
          if (P.isZero) {
            return [];
          } else {
            return [P];
          }
        }

        /**
         * __SPSMREC-1.2(a)__
         */
        if (isConst(u1) && u1.isZero) {
          return [u2];
        }

        /**
         * __SPSMREC-1.2(b)__
         */
        if (isConst(u2) && u2.isZero) {
          return [u1];
        }

        /**
         * __SPSMREC-1.3__ Collect integer and fraction
         * coefficient of like terms in a sum.
         */
        const u1Term = termOf(u1);
        const u2Term = termOf(u2);
        if (u1Term.equals(u2Term)) {
          const S = simplify_sum(sum([constantOf(u1), constantOf(u2)]));
          if (isConst(S) && S.isZero) {
            return [];
          } else {
            return [S];
          }
        }

        /**
         * __SPSMREC-1.4__ Order the arguments.
         */
        if (precedes(u1, u2)) {
          return [u1, u2];
        }

        /**
         * __SPSMREC-1.5__
         */
        return L;
      }
      if (L.length === 2 && (isSum(L[0]) || isSum(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];
        if (isSum(u1) && isSum(u2)) {
          return merge_sums(u1.args, u2.args);
        }
        else if (isSum(u1) && !isSum(u2)) {
          return merge_sums(u1.args, [u2]);
        }
        else {
          return merge_sums([u1], u2.args);
        }
      }
      throw new Error(`simplify_sum_rec not implemented`);
    };
    const spsm = (u: Sum): AlgebraicExpression => {
      const L = u.args;
      /**
       * __SPSM-1__.
       */
      if (hasUndefined(L)) {
        return Undefined();
      }

      // sum has no analogue for SPRD-2

      /**
       * __SPSM-3__.
       */
      if (L.length === 1) {
        return L[0];
      }

      /**
       * __SPSM_4__. The first first 2 rules do not apply.
       */
      const v = simplify_sum_rec(L);
      if (v.length === 1) {
        return v[0];
      }
      if (v.length >= 2) {
        return sum(v);
      }
      return int(0);
    };
    return spsm(expr);
  };

  const simplify_product = (expr: Product): AlgebraicExpression => {
    /**
     * Where `p` and `q` are two ordered lists of factors,
     * merges the two lists.
     */
    // deno-fmt-ignore
    const merge_products = (a: AlgebraicExpression[], b: AlgebraicExpression[]): AlgebraicExpression[] => {
      const p = sortex(a);
      const q = sortex(b);

      /**
       * __MPRD-1__.
       */
      if (q.length === 0) {
        return p;
      }
      else if (p.length === 0) {
        return q;
      }
      const p1 = p[0];
      const q1 = q[0];
      const h = simplify_product_rec([p1, q1]);
      if (h.length === 0) {
        return merge_products(rest(p), rest(q));
      }
      else if (h.length === 1) {
        return adjoin(h[0], merge_products(rest(p),rest(q)));
      }
      else if (h.length===2 && h[0].equals(p1) && h[1].equals(q1)) {
        return adjoin(p1, merge_products(rest(p),q));
      }
      else {
        return adjoin(q1, merge_products(p,rest(q)));
      }
    };

    /**
     * Simplifies a product’s argument list recursively.
     */
    // deno-fmt-ignore
    const simplify_product_rec = (L: AlgebraicExpression[]): AlgebraicExpression[] => {
      /**
       * __SPRDREC-1__. Case: There are two arguments, neither of which is a product.
       */
      if (L.length === 2 && !isProduct(L[0]) && !isProduct(L[1])) {
        const u1 = L[0];
        const u2 = L[1];
        /**
         * __SPRDREC-1.1__.
         */
        if (isConst(u1) && isConst(u2)) {
          const P = simplify_RNE(product([u1, u2]));
          if (P.isOne) {
            return [];
          } else {
            return [P];
          }
        }
        /**
         * __SPRDREC-1.2(a)__
         */
        if (isConst(u1) && u1.isOne) {
          return [u2];
        }
        /**
         * __SPRDREC-1.2(b)__
         */
        if (isConst(u2) && u2.isOne) {
          return [u1];
        }
        /**
         * __SPRDREC-1.3__.
         */
        const u1_base = baseOf(u1);

        const u2_base = baseOf(u2);

        if (u1_base.equals(u2_base)) {
          const S = simplify_sum(sum([exponentOf(u1), exponentOf(u2)]));
          const P = simplify_power(power(u1_base, S));
          if (isConst(P) && P.isOne) {
            return [];
          } else {
            return [P];
          }
        }

        /**
         * __SPRDREC-1.4__.
         */
        if (precedes(u2, u1)) {
          return [u2, u1];
        }
        /**
         * __SPRDREC-1.5__. Case: None of the first four laws apply.
         */
        return L;
      }

      /**
       * __SPRDREC-2__. Case: There are two arguments, one of which is a product.
       */
      if (L.length === 2 && (isProduct(L[0]) || isProduct(L[1]))) {
        const u1 = L[0];
        const u2 = L[1];

        /**
         * __SPRDREC-2.1__. `u1` is a product and `u2` is a product.
         */
        if (isProduct(u1) && isProduct(u2)) {
          return merge_products(u1.args, u2.args);
        } /**
         * __SPRDREC-2.2__. `u1` is a product and `u2` is not a product.
         */
        else if (isProduct(u1) && !isProduct(u2)) {
          return merge_products(u1.args, [u2]);
        } /**
         * __SPRDREC-2.3__. `u2` is a product and `u1` is not a product
         */
        else {
          return merge_products([u1], u2.args);
        }
      } /**
       * __SPRDREC-3__. Case: There are more than two arguments.
       */
      else {
        const w = simplify_product_rec(rest(L));
        const u1 = L[0];
        if (isProduct(u1)) {
          return merge_products(u1.args, w);
        } else {
          return merge_products([u1], w);
        }
      }
    };

    const sprd = (u: Product) => {
      const L = u.args;
      /**
       * __SPRD-1__. `u`’s arguments contain the symbol `Undefined`.
       */
      if (hasUndefined(L)) {
        return Undefined();
      }

      /**
       * __SPRD-2__. `u`’s arguments contain a zero.
       */
      if (hasZero(L)) {
        return int(0);
      }

      /**
       * __SPRD-3__. `u`’s arguments are of length 1.
       */
      if (L.length === 1) {
        return L[0];
      }

      /**
       * __SPRD-4__. None of the first three rules apply.
       */
      const v = simplify_product_rec(L);

      /**
       * __SPRD-4.1__. Case: L reduced to a single operand.
       */
      if (v.length === 1) {
        return v[0];
      }

      /**
       * __SPRD-4.2__. Case: L reduced to at least two operands.
       */
      if (v.length >= 2) {
        return product(v);
      }

      /**
       * __SPRD-4.3__. Case: L reduced to zero operands.
       */
      return int(1);
    };

    return sprd(expr);
  };

  /**
   * Simpifies a power expression.
   */
  const simplify_power = (u: Power): AlgebraicExpression => {
    // deno-fmt-ignore
    const simplify_integer_power = (v: AlgebraicExpression, n: Int): AlgebraicExpression => {
      /**
       * __SINTPOW-1__. We handle the simple case where it’s a number (or fraction)
       * raised to an integer.
       */
      if (isNumeric(v)) {
        return simplify_RNE(power(v, n));
      }

      /**
       * __SINTPOW-2__. Next, the case where `n = 0`. In that case, we return `1`,
       * per the familiar rule `k^0 = 1`, where `k` is some number.
       */
      if (n.isZero) {
        return int(1);
      }

      /**
       * __SINTPOW-3__. Now the case where `n = 1`. Once more, we apply a basic
       * rule: `k^1 = k`, where `k` is some expression.
       */
      if (n.isOne) {
        return v;
      }

      /**
       * __SINTPOW-4__. We handle the case `(r^s)^n = r^(s * n)`.
       */
      if (isPower(v)) {
        const r = v.base;
        const s = v.exponent;
        const p = simplify_product(product([s, n]));
        if (isInt(p)) {
          return simplify_integer_power(r, p);
        } else {
          return power(r, p);
        }
      }

      /**
       * __SINTPOW 5__. This handles the case:
       * `v^n = (v_1, * ... * v_m)^n = v_1^n * ... * v_m^n`
       */
      if (isProduct(v)) {
        const args: AlgebraicExpression[] = [];

        for (let i = 0; i < v.numberOfOperands; i++) {
          const r_i = simplify_integer_power(v.args[i], n);
          args.push(r_i);
        }

        const r = product(args);

        return simplify_product(r);
      }

      /**
       * __SINTPOW-6__. None of the rules apply.
       */
      return power(v, n);
    };
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
        return simplify_integer_power(v, w);
      }

      /**
       * None of the 4 previous rules apply, so we return `u`.
       */
      return u;
    };

    return spow(u.base, u.exponent);
  };

  /**
   * Simplifies the given algebraic expression `u`. This is the main
   * simplification algorithm.
   */
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
  return automatic_simplify(expression);
}

/**
 * Returns true if the given `expression` is a single-variable monomial
 * with respect to the given `variable`.
 */
function isMonomial1(expression: AlgebraicExpression, variable: string | Sym) {
  const x: Sym = isString(variable) ? sym(variable) : variable;
  const monomial_sv = (u: Expression): boolean => {
    if (isInt(u) || isFrac(u)) {
      return true;
    } else if (u.equals(x)) {
      return true;
    } else if (isPower(u)) {
      const base = u.base;
      const exponent = u.exponent;
      if (base.equals(x) && isInt(exponent) && exponent.n > 1) {
        return true;
      }
    } else if (isProduct(u)) {
      const has_two_operands = u.numberOfOperands === 2;
      const operand1_is_monomial = monomial_sv(u.operand(1));
      const operand2_is_monomial = monomial_sv(u.operand(2));
      return (
        has_two_operands &&
        operand1_is_monomial &&
        operand2_is_monomial
      );
    }
    return false;
  };
  const exp = simplify(expression);
  return monomial_sv(exp);
}

// deno-fmt-ignore
enum tt {
  // Utility tokens - - - - - - - - - - - - - - - - - - - - - - - -
  
  /** A utility token indicating the end of input. */
  END,

  /** A utility token indicating an error. */
  ERROR,

  /** A utility token mapped to the empty token. */
  EMPTY,

  // Paired Delimiters - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"("` */
  lparen,

  /** Lexeme: `")"` */
  rparen,

  /** Lexeme: `"{"` */
  lbrace,

  /** Lexeme: `"}"` */
  rbrace,
  
  /** Lexeme: `"["` */
  lbracket,

  /** Lexeme: `"]"` */
  rbracket,
  
  // Strict Delimiters - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `";"` */
  semicolon,

  /** Lexeme: `":"` */
  colon,
  
  /** Lexeme: `"."` */
  dot,
  
  /** Lexeme: `","` */
  comma,

  // Operator delimiters - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"+"` */
  plus,
  
  /** Lexeme: `"-"` */
  minus,

  /** Lexeme: `"*"` */
  star,
  
  /** Lexeme: `"/"` */
  slash,
  
  /** Lexeme: `"^"` */
  caret,

  /** Lexeme: `"%"` */
  percent,
  
  /** Lexeme `"!"`. */
  bang,
  
  /** Lexeme: `"&"` */
  amp,
  
  /** Lexeme: `"~"` */
  tilde,
  
  /** Lexeme: `"|"` */
  vbar,
  
  /** Lexeme: `"="` */
  eq,
  
  /** Lexeme: `"<"` */
  lt,

  /** Lexeme: `">"` */
  gt,
  
  // Operative Dipthongs - - - - - - - - - - - - - - - - - - - - - - -
  
  /** Lexeme: `"!="` */
  neq,
  
  /** Lexeme: `"<="` */
  leq,
  
  /** Lexeme: `">="` */
  geq,
  
  /** Lexeme: `"=="` */
  deq,
  
  
  // Literals - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  variable, string, bool,
  int, float, bignumber, bigfraction,
  scientific, fraction, nan, inf, nil,
  numeric_constant,

  // Native Calls - - - - - - - - - - - - - - - - - - - - - - - - - -
  native_unary,
  native_binary,
  native_polyary,

  // Keywords - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  and,or,not,nand,xor,xnor,nor, // Logical operators
  if,else, // predicators
  fn, // function declarative
  let, // variable declarative
  return, // return particle
  while, // while-loop particle
  for, // for-loop particle
  struct, // struct declarative
  print, // print statement

  /* operator `"rem"` */
  rem,
  /* operator `"mod"` */
  mod,
  /* operator `"div"` */
  div,
}
type NumberTokenType =
  | tt.int
  | tt.float
  | tt.scientific
  | tt.bignumber
  | tt.bigfraction
  | tt.fraction;

type LIT = number | boolean | string | bigint | null | [number, number] | [
  bigint,
  bigint,
];
type Location = { line: number; column: number };
const location = (line: number, column: number): Location => ({ line, column });
class Token<T extends tt = tt, L extends LIT = LIT> {
  /** This token’s {@link tt|type}. */
  type: T;
  /** This token’s lexeme. */
  lexeme: string;
  /** This token’s literal value. */
  literal: L = null as any;
  /** The line where this token was recognized. */
  line: number;
  /** The column where this token was recognized. */
  column: number;
  loc(): Location {
    return location(this.line, this.column);
  }

  static empty: Token<tt, any> = new Token(tt.EMPTY, "", -1, -1);
  static END: Token<tt, any> = new Token(tt.END, "END", -1, -1);

  static of<X extends tt>(type: X, lexeme: string) {
    return new Token(type, lexeme, 0, 0);
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.type === types[i]) {
        return true;
      }
    }
    return false;
  }
  /**
   * Returns true if this token maps to the error token.
   */
  isError(): this is Token<tt.ERROR> {
    return this.type === tt.ERROR;
  }
  isVariable(): this is Token<tt.variable> {
    return (this.type === tt.variable);
  }

  toString() {
    return this.lexeme;
  }

  is<x extends tt>(type: x): this is Token<x> {
    return (this.type === type as any);
  }

  constructor(
    type: T,
    lexeme: string,
    line: number,
    column: number,
    literal: L = null as any,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.line = line;
    this.column = column;
    this.literal = literal;
  }
  /**
   * Returns true if this token is a
   * right-delimiter token. That is,
   * either a `)`, `]`, or `}`.
   */
  isRPD() {
    return (
      this.type === tt.rparen ||
      this.type === tt.rbrace ||
      this.type === tt.rbracket
    );
  }
  /**
   * Sets this token’s lexeme.
   */
  lex(lexeme: string) {
    return new Token(
      this.type,
      lexeme,
      this.line,
      this.column,
      this.literal,
    );
  }
  /**
   * Sets this token’s type.
   */
  entype<X extends tt>(type: X) {
    return new Token(
      type,
      this.lexeme,
      this.line,
      this.column,
      this.literal,
    );
  }

  /**
   * Sets this token’s column.
   */
  encolumn(columnNumber: number) {
    return new Token(
      this.type,
      this.lexeme,
      this.line,
      columnNumber,
      this.literal,
    );
  }
  enline(lineNumber: number) {
    return new Token(
      this.type,
      this.lexeme,
      lineNumber,
      this.column,
      this.literal,
    );
  }
  lit<X extends LIT>(value: X) {
    return new Token(
      this.type,
      this.lexeme,
      this.line,
      this.column,
      value,
    );
  }
  /**
   * Returns true if this token maps
   * to `true` or `false`.
   */
  isBoolean(): this is Token<T, boolean> {
    return (
      isBoolean(this.literal)
    );
  }
  /**
   * Returns true if this token maps
   * to an integer or float token.
   */
  isNumber(): this is Token<T, number> {
    return (
      isNumber(this.literal)
    );
  }
  isNumLike() {
    return this.among([
      tt.int,
      tt.float,
      tt.bignumber,
      tt.bigfraction,
      tt.scientific,
      tt.fraction,
      tt.nan,
      tt.inf,
      tt.numeric_constant,
    ]);
  }
  /**
   * Returns true if this token maps
   * to a big integer token.
   */
  isBigNumber(): this is Token<T, bigint> {
    return (
      isBigInt(this.literal)
    );
  }
  /**
   * Returns true if this token maps
   * to a big rational token.
   */
  isBigRational(): this is Token<tt.bigfraction, [bigint, bigint]> {
    return (
      this.type === tt.bigfraction
    );
  }
  /**
   * Returns true if this token maps
   * to a scientific number token.
   */
  isScientific(): this is Token<tt.scientific, [number, number]> {
    return (this.type === tt.scientific);
  }
  /**
   * Returns true if this token maps
   * to a fraction token.
   */
  isFraction(): this is Token<tt.fraction, [number, number]> {
    return (this.type === tt.fraction);
  }
  /**
   * Returns true if this token maps
   * to a big fraction token.
   */
  isBigFraction(): this is Token<tt.bigfraction, [bigint, bigint]> {
    return (this.type === tt.bigfraction);
  }
  /**
   * Returns a copy of this token.
   */
  copy() {
    const type = this.type;
    const lexeme = this.lexeme;
    const line = this.line;
    const literal = this.literal;
    const column = this.column;
    return new Token(type, lexeme, line, column, literal);
  }
}

/**
 * Returns a new token.
 * @parameter type - The token’s {@link tt|type}.
 * @parameter lexeme - The token’s lexeme.
 * @parameter line - The line where this token was recognized.
 * @parameter column - The column where this token was recognized.
 */
function token<X extends tt>(
  type: X,
  lexeme: string,
  line: number,
  column: number,
) {
  return new Token(type, lexeme, line, column);
}

function isLatinGreek(char: string) {
  return /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(char);
}

function isMathSymbol(char: string) {
  return /^[∀-⋿]/u.test(char);
}

function isValidName(char: string) {
  return (isLatinGreek(char) || isMathSymbol(char));
}

function isDigit(char: string) {
  return "0" <= char && char <= "9";
}

/**
 * Returns true if the given character is a greek letter name.
 */
function isGreekLetterName(c: string) {
  return /^(alpha|beta|gamma|delta|epsilon|zeta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|upsilon|phi|chi|psi|omega)/
    .test(c.toLowerCase());
}
type NativeUnary = "sin" | "cos" | "tan" | "lg" | "ln" | "!";
type NativePolyAry = "max" | "min";
type NativeFn = NativeUnary | NativePolyAry;

function lexicalAnalysis(input: string) {
  /**
   * All variables prefixed with a `$` are
   * stateful variables.
   */

  /** The current line. */
  let $line = 1;

  /** The current column. */
  let $column = 0;

  /**
   * Points to the first character
   * of the lexeme currently being
   * scanned.
   */
  let $start = 0;

  /**
   * Points at the character currently
   * being read.
   */
  let $current = 0;

  /**
   * Error indicator defaulting to null.
   * If initialized, scanning will cease (per the condition
   * in {@link atEnd}).
   */
  let $error: null | Err = null;

  /**
   * Returns true if the scanner has reached
   * the end of input.
   */
  const atEnd = () => ($current >= input.length) || ($error !== null);

  /**
   * Consumes and returns the next character
   * in the input expression.
   */
  const tick = () => input[$current++];

  /**
   * Returns the input substring from
   * start to current.
   */
  const slice = () => input.slice($start, $current);

  /**
   * Returns a new token.
   * An optional lexeme may be passed.
   */
  const tkn = (type: tt, lexeme: string | null = null) => {
    lexeme = lexeme ? lexeme : slice();
    return token(type, lexeme, $line, $column);
  };

  /**
   * Returns an error token. If called,
   * sets the mutable error variable.
   */
  const errorTkn = (message: string, phase: string): Token<tt.ERROR> => {
    const out = tkn(tt.ERROR, message);
    $error = lexicalError(message, phase, $line, $column);
    return out as Token<tt.ERROR>;
  };

  /**
   * Returns the current character.
   */
  const peek = () => atEnd() ? "" : input[$current];

  /**
   * Returns the character just
   * head of the current character.
   */
  const peekNext = () => atEnd() ? "" : input[$current + 1];

  /**
   * Returns the character
   * n places ahead of current.
   */
  const lookup = (n: number) => atEnd() ? "" : input[$current + n];

  /**
   * If the provided expected string
   * matches, increments the current
   * pointer and returns true.
   * Otherwise returns false without
   * increment.
   */
  const match = (expected: string) => {
    if (atEnd()) return false;
    if (input[$current] !== expected) return false;
    $current++;
    return true;
  };

  /**
   * Returns true if the current peek (the character
   * pointed at by `current`) matches the provided
   * number.
   */
  const peekIs = (c: string) => (peek() === c);

  /**
   * Consumes all whitespice while
   * moving the scanner’s `current`
   * pointer forward.
   */
  const skipws = () => {
    while (!atEnd()) {
      const c = peek();
      // deno-fmt-ignore
      switch (c) {
        case ' ':
        case '\r':
        case '\t': 
          tick();
          $column++;
          break;
        case '\n':
          $line++;
          $column=0;
          tick();
          break;
        default:
          return;
      }
    }
  };

  const numToken = (
    numberString: string,
    type: NumberTokenType,
    hasSeparators: boolean,
  ): Token => {
    const n = hasSeparators ? numberString.replaceAll("_", "") : numberString;
    switch (type) {
      case tt.int: {
        const num = Number.parseInt(n);
        if (num > MAX_INT) {
          return errorTkn(
            `Encountered an integer overflow. Consider rewriting “${numberString}” as a bignumber: “#${numberString}”. If “${numberString}” is to be used symbolically, consider rewriting “${numberString}” as a scientific number.`,
            "scanning an integer literal",
          );
        } else {
          return tkn(type).lit(num);
        }
      }
      case tt.float: {
        const num = Number.parseFloat(n);
        if (num > Number.MAX_VALUE) {
          return errorTkn(
            `Encountered a floating point overflow. Consider rewriting "${n}" as a fraction or bigfraction. If "${n}" is to be used symbolically, consider rewriting "${n}" as a scientific number.`,
            "scanning a floating point literal",
          );
        }
        return tkn(tt.float).lit(num);
      }
      case tt.scientific: {
        const [a, b] = n.split("E");
        const base = Number.parseFloat(a);
        const exponent = Number.parseInt(b);
        return tkn(type).lit(tuple(base, exponent));
      }
      case tt.fraction: {
        const [a, b] = n.split("|");
        const N = Number.parseInt(a);
        const D = Number.parseInt(b);
        if (N > MAX_INT || D > MAX_INT) {
          return tkn(tt.bigfraction).lit(tuple(
            BigInt(N),
            BigInt(D),
          ));
        } else {
          return tkn(type).lit(tuple(N, D));
        }
      }
      default: {
        return errorTkn(`Unknown number type`, `scanning a literal number`);
      }
    }
  };

  const number = (initialType: NumberTokenType) => {
    let type = initialType;
    let scannedSeparators = false;
    // scanning integer
    while (isDigit(peek()) && !atEnd()) {
      tick();
    }
    if (peekIs("_") && isDigit(peekNext())) {
      tick(); // eat the '_'
      const phase = `scanning a number with separators`;
      scannedSeparators = true;
      // scan separators
      let digits = 0;
      while (isDigit(peek()) && !atEnd()) {
        tick();
        digits++;
        if (peekIs("_") && isDigit(peekNext())) {
          if (digits === 3) {
            tick();
            digits = 0;
          } else {
            return errorTkn(
              `There must be 3 ASCII digits before the numeric separator “_”.`,
              phase,
            );
          }
        }
      }
      if (digits !== 3) {
        return errorTkn(
          `There must be 3 ASCII digits after the numeric separator “_”.`,
          phase,
        );
      }
    }
    if (peekIs(".") && isDigit(peekNext())) {
      tick();
      type = tt.float;
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
    }

    /**
     * Rational numbers take the form:
     * ~~~ts
     * [int] '|' [int]
     * // e.g., 1|2
     * ~~~
     * Both sides must be integers.
     */
    if (peekIs("|")) {
      if (type !== tt.int) {
        return errorTkn(
          `Expected an integer before “|”`,
          "scanning a fraction",
        );
      }
      type = tt.fraction;
      tick(); // eat the '|'
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
      return numToken(slice(), type, scannedSeparators);
    }

    // scientific
    /**
     * Syntax is: [float] 'E' ('+'|'-') [int]
     * The exponent must always be an integer.
     */
    if (peekIs("E")) {
      if (isDigit(peekNext())) {
        // This is a scientific with the form [float] E [int]
        type = tt.scientific;
        tick(); // eat the 'E'
        while (isDigit(peek())) tick();
      } else if (
        ((peekNext() === "+") || (peekNext() === "-")) && isDigit(lookup(2))
      ) {
        // This is a scientific with the form [float] E (+|-) [int]
        type = tt.scientific;
        tick(); // eat the 'E'
        tick(); // eat the '+' or '-'
        while (isDigit(peek())) tick();
      }
    }
    return numToken(slice(), type, scannedSeparators);
  };

  /**
   * Record of native functions. Each key corresponds
   * to the native function name. The number mapped to
   * by the key is the function’s arity (the number
   * of arguments the function takes).
   */
  const nativeFunctions: Record<NativeFn, number> = {
    sin: 1,
    cos: 1,
    tan: 1,
    lg: 1,
    ln: 1,
    "!": 1,
    max: 1000,
    min: 1000,
  };

  /**
   * Scans a single-quoted variable.
   */
  const scanVariable = () => {
    while (peek() !== `'` && !atEnd()) {
      if (peek() === `\n`) {
        $line++;
        $column = 0;
      } else {
        $column++;
      }
      tick();
    }
    if (atEnd()) {
      return errorTkn(`Infinite variable name`, "scanning a variable");
    }
    tick();
    return tkn(tt.variable);
  };

  const scanString = () => {
    while (peek() !== `"` && !atEnd()) {
      if (peek() === `\n`) {
        $line++;
        $column = 0;
      } else {
        $column++;
      }
      tick();
    }
    if (atEnd()) return errorTkn(`Infinite string`, "scanning a string");
    tick();
    return tkn(tt.string);
  };

  /**
   * Scans a word. Word is defined as
   * either a user-defined symbol (the token `SYM`)
   * or a reserved word.
   */
  const word = () => {
    while ((isValidName(peek()) || isDigit(peek())) && (!atEnd())) {
      tick();
    }
    const string = slice();
    const native = nativeFunctions[string as NativeFn];
    if (native !== undefined) {
      // deno-fmt-ignore
      switch (native) {
        case 1: return tkn(tt.native_unary);
        case 2: return tkn(tt.native_binary);
        default: return tkn(tt.native_polyary);
      }
    }
    // deno-fmt-ignore
    switch (string) {
      case 'false': return tkn(tt.bool).lit(false);
      case 'true': return tkn(tt.bool).lit(true);
      case 'NAN': return tkn(tt.nan).lit(NaN);
      case 'Inf': return tkn(tt.inf).lit(Infinity);
      case 'pi': return tkn(tt.numeric_constant).lit(PI);
      case 'e': return tkn(tt.numeric_constant).lit(E);
      case 'return': return tkn(tt.return);
      case 'while': return tkn(tt.while);
      case 'for': return tkn(tt.for);
      case 'let': return tkn(tt.let);
      case 'fn': return tkn(tt.fn);
      case 'if': return tkn(tt.if);
      case 'else': return tkn(tt.else);
      case 'print': return tkn(tt.print);
      case 'rem': return tkn(tt.rem);
      case 'mod': return tkn(tt.mod);
      case 'nil': return tkn(tt.nil).lit(null);
      case 'and': return tkn(tt.and);
      case 'or': return tkn(tt.or);
      case 'nor': return tkn(tt.nor);
      case 'xor': return tkn(tt.xor);
      case 'xnor': return tkn(tt.xnor);
      case 'not': return tkn(tt.not);
      case 'nand': return tkn(tt.nand);
    }
    return tkn(tt.variable);
  };

  const isHexDigit = (char: string) => (
    (("0" <= char) && (char <= "9")) ||
    (("a" <= char) && (char <= "f")) ||
    (("A" <= char) && (char <= "F"))
  );

  const isOctalDigit = (char: string) => (
    "0" <= char && char <= "7"
  );

  const hexNumber = () => {
    if (!(isHexDigit(peek()))) {
      return errorTkn(
        `Expected hexadecimals after “0x”`,
        "scanning a hexadecimal",
      );
    }
    while (isHexDigit(peek()) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0x", "");
    const n = Number.parseInt(s, 16);
    return tkn(tt.int).lit(n);
  };

  const octalNumber = () => {
    if (!(isOctalDigit(peek()))) {
      return errorTkn(
        `Expected octal digits after “0o”`,
        "scanning an octal number",
      );
    }
    while (isOctalDigit(peek()) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0o", "");
    const n = Number.parseInt(s, 8);
    return tkn(tt.int).lit(n);
  };

  const binaryNumber = () => {
    if (!(peekIs("0") || peekIs("1"))) {
      return errorTkn(
        `Expected binary digits after “0b”`,
        "scanning a binary number",
      );
    }
    while ((peekIs("0") || peekIs("1")) && !atEnd()) {
      tick();
    }
    const s = slice().replace("0b", "");
    const n = Number.parseInt(s, 2);
    return tkn(tt.int).lit(n);
  };
  const scanBigNumber = () => {
    let didSeeVBAR = false;
    while (isDigit(peek()) && !atEnd()) {
      tick();
    }
    if (peekIs("|") && isDigit(peekNext())) {
      tick(); // eat the '|'
      didSeeVBAR = true;
      while (isDigit(peek()) && !atEnd()) {
        tick();
      }
    }
    const n = slice().replace("#", "");
    if (didSeeVBAR) {
      const [a, b] = n.split("|");
      const N = BigInt(a);
      const D = BigInt(b);
      return tkn(tt.bigfraction).lit([N, D]);
    }
    return tkn(tt.bignumber).lit(BigInt(n));
  };

  /** Scans a token. */
  const scan = (): Token => {
    skipws();
    $start = $current;
    if (atEnd()) {
      return tkn(tt.END, "END");
    }
    const c = tick();
    if (isValidName(c)) {
      return word();
    }
    if (c === "#") {
      if (!isDigit(peek())) {
        return errorTkn(`Expected digits after “#”`, `scanning a bignumber`);
      } else {
        const out = scanBigNumber();
        return out;
      }
    }
    if (isDigit(c)) {
      if (c === "0" && match("b")) {
        return binaryNumber();
      } else if (c === "0" && match("o")) {
        return octalNumber();
      } else if (c === "0" && match("x")) {
        return hexNumber();
      }
      return number(tt.int);
    }
    // deno-fmt-ignore
    switch (c) {
      case ":": return tkn(tt.colon);
      case "&": return tkn(tt.amp);
      case "~": return tkn(tt.tilde);
      case "|": return tkn(tt.vbar);
      case "(": return tkn(tt.lparen);
      case ")": return tkn(tt.rparen);
      case "[": return tkn(tt.lbracket);
      case "]": return tkn(tt.rbracket);
      case "{": return tkn(tt.lbrace);
      case "}": return tkn(tt.rbrace);
      case ",": return tkn(tt.comma);
      case ".": return tkn(tt.dot);
      case "-": return tkn(tt.minus);
      case "+": return tkn(tt.plus);
      case "*": return tkn(tt.star);
      case ";": return tkn(tt.semicolon);
      case '%': return tkn(tt.percent);
      case "/": return tkn(tt.slash);
      case "^": return tkn(tt.caret);
      case '!': return tkn(match('=') ? tt.neq : tt.bang);
      case '=': return tkn(match('=') ? tt.deq : tt.eq);
      case '<': return tkn(match('=') ? tt.leq : tt.deq);
      case '>': return tkn(match('=') ? tt.geq : tt.gt);
      case `"`: return scanString();
      case `'`: return scanVariable();
    }
    return errorTkn(`Unknown token: “${c}”`, "scanning");
  };
  const stream = () => {
    const out: Token[] = [];
    let prev = Token.empty;
    let now = scan();
    out.push(now);
    let peek = scan();
    while (!atEnd()) {
      if ($error !== null) {
        return left($error);
      }
      prev = now;
      now = peek;
      peek = scan();
      if (prev.isRPD() && now.is(tt.comma) && peek.isRPD()) {
        continue;
      }
      out.push(now);
    }
    out.push(peek);
    return right(out);
  };

  return stream();
}

/**
 * Given an array of tokens, splits
 * all multicharacter symbols into
 * individual symbols, provided
 * the multicharacter symbol is:
 *
 * 1. not a Greek letter name,
 * 2. not a core function name, and
 * 3. does not include the character `_`.
 */
function symsplit(tokens: Token[]) {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t1 = tokens[i];
    if (
      t1.isVariable() && !isGreekLetterName(t1.lexeme) &&
      !t1.lexeme.includes("_") && !t1.lexeme.includes("$") &&
      !t1.lexeme.includes(`'`)
    ) {
      t1.lexeme.split("").map((c) => token(tt.variable, c, t1.line, t1.column))
        .forEach((v) => out.push(v));
    } else {
      out.push(t1);
    }
  }
  return out;
}

function imul(tkns: Token[]) {
  const out: Token[] = [];
  const tokens = zip(tkns, tkns.slice(1));
  for (let i = 0; i < tokens.length; i++) {
    const [now, nxt] = tokens[i];
    out.push(now);
    if (now.is(tt.rparen)) {
      if (nxt.is(tt.variable)) {
        out.push(nxt.entype(tt.star).lex("*"));
      } else if (nxt.is(tt.lparen)) {
        out.push(nxt.entype(tt.star).lex("*"));
      }
    } else if (
      now.isNumLike() &&
      (nxt.among([tt.native_unary, tt.native_binary, tt.native_polyary]))
    ) {
      out.push(nxt.entype(tt.star).lex("*"));
    } else if (now.isNumLike() && nxt.is(tt.variable)) {
      out.push(nxt.entype(tt.star).lex("*"));
    } else if (now.isNumLike() && nxt.is(tt.lparen)) {
      out.push(nxt.entype(tt.star).lex("*"));
    } else if (now.is(tt.variable) && nxt.is(tt.variable)) {
      out.push(nxt.entype(tt.star).lex("*"));
    }
  }
  out.push(tkns[tkns.length - 1]);
  return out;
}

enum bp {
  nil,
  lowest,
  assign,
  atom,
  or,
  nor,
  and,
  nand,
  xor,
  xnor,
  not,
  eq,
  rel,
  sum,
  difference,
  product,
  quotient,
  power,
  postfix,
  call,
}
type Parslet = (current: Token, lastNode: Expr) => Either<Err, Expr>;
type ParsletEntry = [Parslet, Parslet, bp];
type BPTable = Record<tt, ParsletEntry>;

function syntaxAnalysis(lexemes: Right<Token<tt, LIT>[]> | Left<Err>) {
  if (lexemes.isLeft()) {
    return lexemes;
  }
  const tokens = lexemes.unwrap();
  /**
   * Variable bound to the current error status.
   * If this variable is not bound to null, then
   * an error occurred. This variable should only
   * be modified through the {@link error} function
   * to ensure line and column numbers are properly
   * recorded.
   */
  let $error: null | Err = null;

  /** Pointer to the current token. */
  let $cursor = -1;

  /** The maximum possible cursor position. */
  let $max = tokens.length;

  /** The token immediately after the current token. */
  let $peek = Token.empty;

  /** The current token. */
  let $current = Token.empty;

  /** The last node parsed. */
  let $lastNode: ASTNode = nil();

  /**
   * Returns true if there are no longer any tokens or if
   * an {@link $error|error} occurred, false otherwise.
   */
  const atEnd = () => ($cursor >= $max - 1) || ($error !== null);

  /**
   * Moves the {@link $cursor|cursor} forward and returns
   * the current {@link $peek|peek}.
   */
  const next = () => {
    $cursor++;
    $current = $peek;
    const nextToken = tokens[$cursor] ? tokens[$cursor] : Token.END;
    $peek = nextToken;
    return $current;
  };

  /**
   * If the given type matches
   * the upcoming token (the peek),
   * moves the state forward. Otherwise,
   * leaves the state as is.
   */
  const nextIs = (type: tt) => {
    if ($peek.is(type)) {
      next();
      return true;
    }
    return false;
  };

  /**
   * Given the list of token types, moves the {@link $cursor|cursor}
   * forward and returns true on the first type matching the
   * token just ahead. Otherwise, returns false wit no forwarding.
   */
  const matches = (types: tt[]) => {
    for (let i = 0; i < types.length; i++) {
      if ($peek.is(types[i])) {
        next();
        return true;
      }
    }
    return false;
  };

  /**
   * If called, sets the state’s error
   * status to the provided error message,
   * and returns a {@link Left}. If
   * the state’s error field is initialized
   * (by default `null`), then the parser
   * will halt immediately and return the
   * error message.
   */
  const error = (message: string, phase: string) => {
    const e = syntaxError(message, phase, $current.line, $current.column);
    $error = e;
    return left(e);
  };

  /**
   * Returns the token at the `currentIndex + index`
   * _without_ changing the index.
   */
  const lookup = (index: number) => {
    const out = tokens[$cursor + index];
    if (out !== undefined) {
      return out;
    } else {
      return Token.END;
    }
  };

  /**
   * Returns true if the next token
   * is the provided type _without_
   * consuming the token.
   */
  const check = (type: tt) => {
    if (atEnd()) {
      return false;
    } else {
      return $peek.is(type);
    }
  };

  /**
   * If called, sets the state’s last
   * parsed node to the provided node T,
   * and returns `Right<T>` (See {@link Right}).
   * All nodes should ultimately return their
   * results through this method so
   * as to allow other nodes to keep
   * track of what was last parsed.
   */
  const newnode = <X extends ASTNode>(node: X) => {
    $lastNode = node;
    return right(node);
  };

  /**
   * Returns true if an implicit
   * semicolon is encountered. An implicit
   * semicolons exists if:
   *
   * 1. The upcoming token is the end of input (`eof` token), or
   * 2. The token stream has reached an unexpected end of input.
   */
  const implicitSemicolonOK = () => {
    return (
      $peek.is(tt.END) ||
      atEnd()
    );
  };

  const number: Parslet = (t) => {
    if (t.isNumber()) {
      return newnode(t.is(tt.float) ? float(t.literal) : integer(t.literal));
    } else {
      return error(
        `Expected an integer, but got “${t.lexeme}”`,
        "parsing an integer",
      );
    }
  };

  const string_literal: Parslet = (t) => {
    return newnode(string(t.lexeme));
  };

  const scientific_number: Parslet = (t) => {
    if (t.isScientific()) {
      const [a, b] = t.literal;
      const lhs = float(a);
      const rhs = binex(
        integer(10),
        token(tt.caret, "^", t.line, t.column),
        integer(b),
      );
      return newnode(binex(
        lhs,
        token(tt.star, "*", t.line, t.column),
        rhs,
      ));
    } else {
      return error(
        `Unexpected scientific number`,
        "parsing a scientific number",
      );
    }
  };

  /**
   * Parses a {@link RelationalExpr|relational expression}.
   */
  const compare = (op: Token, lhs: Expr): Either<Err, RelationalExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      return newnode(relation(lhs, op as Token<RelationalOperator>, rhs));
    });
  };

  /**
   * Parses a right-associative
   * {@link AlgebraicBinaryExpr|algebraic binary expression}.
   */
  const rinfix = (op: Token, lhs: Expr): Either<Err, AlgebraicBinaryExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      const out = binex(lhs, op as Token<ArithmeticOperator>, rhs);
      return newnode(out);
    });
  };

  /**
   * Parses an {@link AlgebraicBinaryExpr|algebraic binary expression}.
   */
  const infix = (op: Token, lhs: Expr): Either<Err, AlgebraicBinaryExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      const out = binex(lhs, op as Token<ArithmeticOperator>, rhs);
      return newnode(out);
    });
  };

  /**
   * Parses a {@link Rational|rational number}.
   */
  const fraction = (op: Token): Either<Err, Rational> => {
    if (op.isFraction()) {
      const [N, D] = op.literal;
      return newnode(rational(floor(N), floor(abs(D))));
    } else {
      return error(`Unexpected rational number`, "parsing a rational number");
    }
  };

  /**
   * Parses a {@link LogicalBinaryExpr|logical infix expression}.
   */
  const logic_infix = (
    op: Token,
    lhs: Expr,
  ): Either<Err, LogicalBinaryExpr> => {
    const p = precof(op.type);
    return expr(p).chain((rhs) => {
      return newnode(
        logicalBinex(lhs, op as Token<BinaryLogicalOperator>, rhs),
      );
    });
  };

  /**
   * Parses a {@link BigNumber|big number}.
   */
  const big_number = (op: Token): Either<Err, BigNumber> => {
    if (op.isBigNumber()) {
      return newnode(bigNumber(op.literal));
    } else {
      return error(`Unexpected big number literal`, `parsing an expression`);
    }
  };

  /**
   * Parses a {@link BigRational|big rational}.
   */
  const big_rational = (op: Token): Either<Err, BigRational> => {
    if (op.isBigFraction()) {
      const [a, b] = op.literal;
      return newnode(bigRational(a, b));
    } else {
      return error(`Unexpected big rational literal`, `parsing an expression`);
    }
  };

  /**
   * Parses a {@link Bool|boolean literal}.
   */
  const boolean_literal = (op: Token): Either<Err, Bool> => {
    if (op.isBoolean()) {
      return newnode(bool(op.literal));
    } else {
      return error(`Unexpected boolean literal`, `parsing an expression`);
    }
  };

  /**
   * Parses a {@link NumericConstant|numeric constant} or {@link Nil|nil}.
   */
  const constant = (op: Token): Either<Err, NumericConstant | Nil> => {
    const type = op.type;
    const erm = `Unexpected constant “${op.lexeme}”`;
    const src = `parsing an expression`;
    // deno-fmt-ignore
    switch (type) {
      case tt.nan: return newnode(numericConstant(NaN, 'NAN'));
      case tt.inf: return newnode(numericConstant(Infinity, 'Inf'));
      case tt.nil: return newnode(nil());
      case tt.numeric_constant: {
        switch (op.lexeme) {
          case "pi": return newnode(numericConstant(PI, "pi"));
          case 'e': return newnode(numericConstant(E, 'e'))
          default: return error(erm, src);
        }
      }
      default: return error(erm, src);
    }
  };

  /**
   * Parses a {@link GroupExpr|parenthesized expression}.
   */
  const primary = (op: Token): Either<Err, GroupExpr | TupleExpr> => {
    const innerExpression = expr();
    if (innerExpression.isLeft()) {
      return innerExpression;
    }
    if (nextIs(tt.comma)) {
      const elements: Expr[] = [innerExpression.unwrap()];
      do {
        const e = expr();
        if (e.isLeft()) {
          return e;
        }
        elements.push(e.unwrap());
      } while (nextIs(tt.comma));
      if (!nextIs(tt.rparen)) {
        return error(`Expected “)” to close the tuple`, `parsing a tuple`);
      }
      return newnode(tupleExpr(elements, op.loc()));
    }
    if (!nextIs(tt.rparen)) {
      return error(
        `Expected closing “)”`,
        "parsing a parenthesized expression",
      );
    }
    return innerExpression.map((e) => grouped(e));
  };

  /**
   * Parses a {@link NativeCall|native function call}.
   */
  const native_call_unary: Parslet = (op): Either<Err, NativeCall> => {
    const lex = op.lexeme;
    const src = `parsing a native call “${lex}”`;
    let name: NativeUnary | null = null;
    // deno-fmt-ignore
    switch (lex as NativeUnary) {
      case "cos": name = "cos"; break;
      case "lg": name = "lg"; break;
      case "ln": name = "ln"; break;
      case "sin": name = "sin"; break;
      case "tan": name = "tan"; break;
    }
    if (name === null) {
      return error(`Unexpected native-call: “${lex}”`, src);
    }
    if (!nextIs(tt.lparen)) {
      return error(`Expected “(” to open the argument list`, src);
    }
    const arg = expr();
    if (arg.isLeft()) {
      return arg;
    }
    const args = [arg.unwrap()];
    if (!nextIs(tt.rparen)) {
      return error(`Expected “)” to close the argument list`, src);
    }
    return newnode(nativeCall(name, args, op.loc()));
  };

  /**
   * Parses a variable name.
   */
  const variable_name: Parslet = (op) => {
    if (op.isVariable()) {
      return newnode(variable(op));
    } else {
      return error(`Unexpected variable “${op.lex}”`, "parsing expression");
    }
  };

  /**
   * Parses a logical not expression.
   */
  const logical_not: Parslet = (op) => {
    const p = precof(op.type);
    return expr(p).chain((arg) =>
      newnode(logicalUnary(op as Token<tt.not>, arg))
    );
  };

  /**
   * Parses an {@link AssignExpr|assignment expression}.
   */
  const assignment = (_: Token, node: Expr): Either<Err, AssignExpr> => {
    const src = `parsing an assignment`;
    if (!isVariable(node)) {
      return error(`Expected a valid assignment target`, src);
    }
    return expr().chain((n) => {
      if (n.isExpr()) {
        return newnode(assign(node.name, n));
      } else {
        return error(
          `Expected an expression on the right-hand side of the assignment`,
          src,
        );
      }
    });
  };

  const comma_separated_list = <K extends Expr>(
    filter: (e: Expr) => e is K,
    errorMessage: string,
    src: string,
  ) => {
    const elements: K[] = [];
    do {
      const e = expr();
      if (e.isLeft()) return e;
      const element = e.unwrap();
      if (!filter(element)) {
        return error(errorMessage, src);
      }
      elements.push(element);
    } while (nextIs(tt.comma));
    return right(elements);
  };

  const function_call = (_: Token, node: Expr): Either<Err, CallExpr> => {
    const callee = node;
    let args: Expr[] = [];
    if (!check(tt.rparen)) {
      const arglist = comma_separated_list(
        isExpr,
        `Expected expression`,
        "call",
      );
      if (arglist.isLeft()) return arglist;
      args = arglist.unwrap();
    }
    const paren = next();
    if (!paren.is(tt.rparen)) {
      return error(`Expected “)” to close args`, "call");
    }
    return newnode(call(callee, args, paren.loc()));
  };

  /**
   * The “blank” parslet. This parslet is used as a placeholder.
   * If the {@link expr|expression parser} calls this parslet,
   * then the {@link error} variable is set and parsing shall cease.
   */
  const ___: Parslet = (t) => {
    if ($error !== null) {
      return left($error);
    } else {
      return error(`Unexpected lexeme: ${t.lexeme}`, `expression`);
    }
  };

  /**
   * The “blank” binding power. This particular binding power
   * is bound either (1) the {@link ___|blank parslet}
   * or (2) parlsets that should not trigger recursive calls.
   */
  const ___o = bp.nil;

  /**
   * The rules table comprises mappings from every
   * {@link tt|token type} to a triple `(Prefix, Infix, B)`,
   * where `Prefix` and `Infix` are {@link Parslet|parslets} (small
   * parsers that handle a single grammar rule), and `B` is a
   * {@link bp|binding power}.
   */
  const rules: BPTable = {
    [tt.END]: [___, ___, ___o],
    [tt.ERROR]: [___, ___, ___o],
    [tt.EMPTY]: [___, ___, ___o],
    [tt.lparen]: [primary, function_call, bp.call],
    [tt.rparen]: [___, ___, ___o],
    [tt.lbrace]: [___, ___, ___o],
    [tt.rbrace]: [___, ___, ___o],
    [tt.lbracket]: [___, ___, ___o],
    [tt.rbracket]: [___, ___, ___o],
    [tt.semicolon]: [___, ___, ___o],
    [tt.colon]: [___, ___, ___o],
    [tt.dot]: [___, ___, ___o],
    [tt.comma]: [___, ___, ___o],

    [tt.bang]: [___, ___, ___o],
    [tt.amp]: [___, ___, ___o],
    [tt.tilde]: [___, ___, ___o],
    [tt.vbar]: [___, ___, ___o],
    [tt.eq]: [___, assignment, bp.assign],

    // algebraic expressions
    [tt.plus]: [___, infix, bp.sum],
    [tt.minus]: [___, infix, bp.difference],
    [tt.star]: [___, infix, bp.product],
    [tt.slash]: [___, infix, bp.quotient],
    [tt.caret]: [___, rinfix, bp.power],
    [tt.percent]: [___, infix, bp.quotient],

    // comparison expressions
    [tt.lt]: [___, compare, bp.rel],
    [tt.gt]: [___, compare, bp.rel],
    [tt.neq]: [___, compare, bp.rel],
    [tt.leq]: [___, compare, bp.rel],
    [tt.geq]: [___, compare, bp.rel],
    [tt.deq]: [___, compare, bp.rel],

    // logical binary expressions
    [tt.nand]: [___, logic_infix, bp.nand],
    [tt.xor]: [___, logic_infix, bp.xor],
    [tt.xnor]: [___, logic_infix, bp.xnor],
    [tt.nor]: [___, logic_infix, bp.nor],
    [tt.and]: [___, logic_infix, bp.and],
    [tt.or]: [___, logic_infix, bp.or],
    [tt.not]: [logical_not, ___, bp.not],

    // literals
    [tt.variable]: [variable_name, ___, bp.atom],
    [tt.string]: [string_literal, ___, bp.atom],
    [tt.bool]: [boolean_literal, ___, bp.atom],
    [tt.int]: [number, ___, bp.atom],
    [tt.float]: [number, ___, bp.atom],
    [tt.bignumber]: [big_number, ___, bp.atom],
    [tt.bigfraction]: [big_rational, ___, bp.atom],
    [tt.scientific]: [scientific_number, ___, bp.atom],
    [tt.fraction]: [fraction, ___, bp.atom],
    [tt.nan]: [constant, ___, bp.atom],
    [tt.inf]: [constant, ___, bp.atom],
    [tt.nil]: [constant, ___, bp.atom],
    [tt.numeric_constant]: [constant, ___, bp.atom],

    // native calls
    [tt.native_unary]: [native_call_unary, ___, bp.call],
    [tt.native_binary]: [___, ___, ___o],
    [tt.native_polyary]: [___, ___, ___o],

    [tt.if]: [___, ___, ___o],
    [tt.else]: [___, ___, ___o],
    [tt.fn]: [___, ___, ___o],
    [tt.let]: [___, ___, ___o],
    [tt.return]: [___, ___, ___o],
    [tt.while]: [___, ___, ___o],
    [tt.for]: [___, ___, ___o],
    [tt.struct]: [___, ___, ___o],
    [tt.print]: [___, ___, ___o],
    [tt.rem]: [___, ___, ___o],
    [tt.mod]: [___, ___, ___o],
    [tt.div]: [___, ___, ___o],
  };
  /**
   * Returns the prefix parsing rule mapped to by the given
   * token type.
   */
  const prefixRule = (t: tt): Parslet => rules[t][0];

  /**
   * Returns the infix parsing rule mapped to by the given
   * token type.
   */
  const infixRule = (t: tt): Parslet => rules[t][1];

  /**
   * Returns the {@link bp|precedence} of the given token type.
   */
  const precof = (t: tt): bp => rules[t][2];

  /**
   * Parses an {@link Expr|conventional expression} via
   * Pratt parsing.
   */
  const expr = (minbp: number = bp.lowest): Either<Err, Expr> => {
    let token = next();
    const pre = prefixRule(token.type);
    let lhs = pre(token, nil());
    if (lhs.isLeft()) {
      return lhs;
    }
    while (minbp < precof($peek.type)) {
      if (atEnd()) {
        break;
      }
      token = next();
      const r = infixRule(token.type);
      const rhs = r(token, lhs.unwrap());
      if (rhs.isLeft()) {
        return rhs;
      }
      lhs = rhs;
    }
    return lhs;
  };

  /**
   * Parses an {@link IfStmt|if-statement}.
   */
  const IF = (): Either<Err, IfStmt> => {
    const c = expr();
    const src = `parsing an if-statement`;
    if (c.isLeft()) {
      return c;
    }
    const condition = c.unwrap();
    if (!nextIs(tt.lbrace)) {
      return error(
        `Expected a left brace “{” to begin the consequent block.`,
        src,
      );
    }
    const consequent = BLOCK();
    if (consequent.isLeft()) {
      return consequent;
    }
    const thenBranch = consequent.unwrap();
    let elseBranch: Statement = exprStmt(
      returnStmt(nil(), $current.loc()),
    );
    if (nextIs(tt.else)) {
      const _else = STMT();
      if (_else.isLeft()) {
        return _else;
      }
      elseBranch = _else.unwrap();
    }
    return newnode(ifStmt(condition, thenBranch, elseBranch));
  };

  /**
   * Parses a {@link FnStmt|function statement} (i.e., a function declaration).
   */
  const FN = (): Either<Err, FnStmt> => {
    // fn eaten in STMT
    const name = next();
    const src = `parsing a function a declaration`;
    if (!name.isVariable()) {
      return error(`Expected a valid identifier for the function’s name.`, src);
    }
    if (!nextIs(tt.lparen)) {
      return error(
        `Expected a left parenthesis “(” to begin the parameter list`,
        src,
      );
    }
    const params: Token<tt.variable>[] = [];
    if (!$peek.is(tt.rparen)) {
      do {
        const expression = next();
        if (!expression.isVariable()) {
          return error(
            `Expected a valid identifier as a parameter, but got “${expression.lexeme}”`,
            src,
          );
        }
        params.push(expression);
      } while (nextIs(tt.comma));
    }
    if (!nextIs(tt.rparen)) {
      return error(
        `Expected a right parenthesis “)” to close the parameter list`,
        src,
      );
    }
    if (nextIs(tt.eq)) {
      const body = EXPRESSION();
      return body.chain((b) => newnode(functionStmt(name, params, b)));
    }
    if (!nextIs(tt.lbrace)) {
      return error(
        `Expected a left-brace “{” to open the function’s body. If this function’s body is composed of a single statement, consider using the assignment operator “=”`,
        src,
      );
    }
    const body = BLOCK();
    return body.chain((b) => newnode(functionStmt(name, params, b)));
  };

  const WHILE = () => {
    const src = `parsing a while loop`;
    const loopCondition = expr();
    if (loopCondition.isLeft()) {
      return loopCondition;
    }
    if (!nextIs(tt.lbrace)) {
      return error(`Expected a block after the condition`, src);
    }
    const body = BLOCK();
    if (body.isLeft()) {
      return body;
    }
    return body.chain((loopBody) =>
      newnode(whileStmt(loopCondition.unwrap(), loopBody))
    );
  };

  /**
   * Parses a {@link BlockStmt|block statement}.
   */
  const BLOCK = (): Either<Err, BlockStmt> => {
    const statements: Statement[] = [];
    const c = $current;
    while (!atEnd() && !check(tt.rbrace)) {
      const stmt = STMT();
      if (stmt.isLeft()) {
        return stmt;
      }
      statements.push(stmt.unwrap());
    }
    if (!nextIs(tt.rbrace)) {
      return error(
        `Expected a right brace “}” to close the block`,
        `parsing a block`,
      );
    }
    return newnode(block(statements, c.loc()));
  };

  /**
   * Parses a {@link LetStmt|let statement}.
   */
  const LET = (): Either<Err, LetStmt> => {
    const src = `parsing a variable declaration`;
    const name = next();
    if (!name.isVariable()) {
      return error(`Expected a valid identifier`, src);
    }
    if (!nextIs(tt.eq)) {
      return error(`Expected an assignment operator “=”`, src);
    }
    const init = EXPRESSION();
    if (init.isLeft()) {
      return init;
    }
    const value = init.unwrap();
    return newnode(letStmt(name, value.expression));
  };

  /**
   * Parses an expression statement.
   */
  const EXPRESSION = (): Either<Err, ExprStmt> => {
    const out = expr();
    if (out.isLeft()) {
      return out;
    }
    const expression = out.unwrap();
    if (nextIs(tt.semicolon) || implicitSemicolonOK()) {
      return newnode(exprStmt(expression));
    }
    return error(`Expected “;” to end the statement`, "expression-statement");
  };

  const RETURN = (): Either<Err, ReturnStmt> => {
    const c = $current;
    const out = EXPRESSION();
    return out.chain((e) => newnode(returnStmt(e.expression, c.loc())));
  };

  /**
   * Parses a statement.
   */
  const STMT = (): Either<Err, Statement> => {
    if (nextIs(tt.let)) {
      return LET();
    } else if (nextIs(tt.fn)) {
      return FN();
    } else if (nextIs(tt.lbrace)) {
      return BLOCK();
    } else if (nextIs(tt.if)) {
      return IF();
    } else if (nextIs(tt.return)) {
      return RETURN();
    } else if (nextIs(tt.while)) {
      return WHILE();
    } else {
      return EXPRESSION();
    }
  };

  const program = () => {
    const stmts: Statement[] = [];
    while (!atEnd()) {
      const stmt = STMT();
      if (stmt.isLeft()) {
        return stmt;
      }
      stmts.push(stmt.unwrap());
    }
    return right(stmts);
  };

  const run = () => {
    next(); // prime the parser
    return program();
  };

  return run();
}

function concat<T>(left: T[], right: T[]): T[] {
  const out: T[] = [];
  for (let i = 0; i < left.length; i++) {
    out.push(left[i]);
  }
  for (let j = 0; j < right.length; j++) {
    out.push(right[j]);
  }
  return out;
}

/**
 * An AST visitor that transforms its given AST into
 * algebraic tree form.
 */
class AlgebraicTree implements Visitor<AlgebraicExpression> {
  error: Err | null = null;
  private croak(message: string, line: number = 0, column: number = 0) {
    this.error = algebraError(
      message,
      "converting to an algebraic tree",
      line,
      column,
    );
    return Undefined();
  }
  map(node: ASTNode) {
    const out = node.accept(this);
    if (this.error !== null) {
      throw this.error;
    }
    return out;
  }
  tupleExpr(node: TupleExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support tuple expressions.`,
    );
  }
  integer(node: Integer): AlgebraicExpression {
    return int(node.value);
  }
  numericConstant(node: NumericConstant): AlgebraicExpression {
    const name = node.sym;
    switch (name) {
      case "Inf":
        return constant("Inf", Infinity);
      case "NAN":
        return constant("NAN", NaN);
      case "e":
        return constant("e", E);
      case "pi":
        return constant("pi", PI);
    }
  }
  bigNumber(node: BigNumber): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support big numbers.`,
    );
  }
  rational(node: Rational): AlgebraicExpression {
    const N = node.n;
    const D = node.d;
    return frac(N, D);
  }
  bigRational(node: BigRational): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support big rationals.`,
    );
  }
  float(node: Float): AlgebraicExpression {
    return real(node.value);
  }
  bool(node: Bool): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support boolean literals.`,
    );
  }
  string(node: StringLiteral): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support string literals.`,
    );
  }
  nil(node: Nil): AlgebraicExpression {
    return Undefined();
  }
  variable(node: Variable): AlgebraicExpression {
    return sym(node.name.lexeme);
  }
  assignExpr(node: AssignExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support assignments.`,
    );
  }
  algebraicBinaryExpr(node: AlgebraicBinaryExpr): AlgebraicExpression {
    const left = this.map(node.left);
    if (isUndefined(left)) {
      return left;
    }
    const right = this.map(node.right);
    if (isUndefined(right)) {
      return right;
    }
    switch (node.op.type) {
      case tt.plus: {
        if (isInt(left) && isInt(right)) {
          return int(left.n + right.n);
        } else if (isSum(left) && isSum(right)) {
          return sum(concat(left.args, right.args));
        } else if (isSum(left)) {
          return sum(concat(left.args, [right]));
        } else if (isSum(right)) {
          return sum(concat([left], right.args));
        } else {
          return sum([left, right]);
        }
      }
      case tt.star: {
        if (isInt(left) && isInt(right)) {
          return int(left.n * right.n);
        } else if (isProduct(left) && isProduct(right)) {
          return product(concat(left.args, right.args));
        } else if (isProduct(left)) {
          return product(concat(left.args, [right]));
        } else if (isProduct(right)) {
          return product(concat([left], right.args));
        } else {
          return product([left, right]);
        }
      }
      case tt.caret: {
        if (isInt(left) && isInt(right)) {
          return int(left.n ** right.n);
        } else {
          return power(left, right);
        }
      }
      case tt.slash: {
        if (isInt(left) && isInt(right)) {
          return frac(left.n, right.n);
        } else {
          return quotient(left, right);
        }
      }
      case tt.minus: {
        if (isInt(left) && isInt(right)) {
          return int(left.n - right.n);
        } else {
          return difference(left, right);
        }
      }
      case tt.rem: {
        return this.croak(
          `The algebra API does not currently support the remainder (“rem”) operator`,
          node.op.line,
          node.op.column,
        );
      }
      case tt.mod: {
        return this.croak(
          `The algebra API does not currently support the mod (“mod”) operator`,
          node.op.line,
          node.op.column,
        );
      }
      case tt.percent: {
        return this.croak(
          `The algebra API does not currently support the percent (“%”) operator`,
          node.op.line,
          node.op.column,
        );
      }
      case tt.div: {
        return this.croak(
          `The algebra API does not currently support the integer division (“div”) operator`,
          node.op.line,
          node.op.column,
        );
      }
    }
  }
  algebraicUnaryExpr(node: AlgebraicUnaryExpr): AlgebraicExpression {
    const arg = this.map(node.arg);
    if (isUndefined(arg)) {
      return arg;
    }
    switch (node.op.type) {
      case tt.plus: {
        if (isInt(arg)) {
          return int(abs(arg.n));
        } else {
          return sum([int(0), arg]);
        }
      }
      case tt.minus: {
        if (isInt(arg)) {
          return int(-arg.n);
        } else {
          return product([int(-1), arg]);
        }
      }
      case tt.bang: {
        if (isInt(arg)) {
          return int(factorialize(arg.n));
        } else {
          return factorial(arg);
        }
      }
    }
  }
  logicalBinaryExpr(node: LogicalBinaryExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support logical binary expressions`,
      node.op.line,
      node.op.column,
    );
  }
  logicalUnaryExpr(node: LogicalUnaryExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support logical unary expressions`,
      node.op.line,
      node.op.column,
    );
  }
  relationalExpr(node: RelationalExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support relational expressions`,
      node.op.line,
      node.op.column,
    );
  }
  callExpr(node: CallExpr): AlgebraicExpression {
    return this.croak(
      `The algebra API does not currently support user-defined functions`,
      node.line,
      node.column,
    );
  }
  nativeCall(node: NativeCall): AlgebraicExpression {
    const args = node.args.map((x) => this.map(x));
    if (hasUndefined(args)) {
      return Undefined();
    }
    // deno-fmt-ignore
    switch (node.name) {
      case "cos": return fn("cos", args);
      case "sin": return fn("sin", args);
      case "tan": return fn("tan", args);
      case "lg": return fn("lg", args);
      case "ln": return fn("ln", args);
      case "max": return fn("max", args);
      case "min": return fn("min", args);
      case "!": return factorial(args[0]);
    }
  }
  groupExpr(node: GroupExpr): AlgebraicExpression {
    const out = this.map(node.expression);
    out.tickParen();
    return out;
  }
  blockStmt(node: BlockStmt): AlgebraicExpression {
    return this.croak(`Expected an expression, but got a block statement.`);
  }
  exprStmt(node: ExprStmt): AlgebraicExpression {
    return this.croak(
      `Expected an expression, but got an expression statement.`,
    );
  }
  fnStmt(node: FnStmt): AlgebraicExpression {
    return this.croak(
      `Expected an expression, but got a function declaration`,
      node.name.line,
      node.name.column,
    );
  }
  ifStmt(node: IfStmt): AlgebraicExpression {
    return this.croak(`Expected an expression, but got a branching statement.`);
  }
  printStmt(node: PrintStmt): AlgebraicExpression {
    return this.croak(`Expected an expression, but got a print statement.`);
  }
  returnStmt(node: ReturnStmt): AlgebraicExpression {
    return this.croak(`Expected an expression, but got a return statement.`);
  }
  letStmt(node: LetStmt): AlgebraicExpression {
    return this.croak(
      `Expected an expression, but got a variable declaration.`,
      node.name.line,
      node.name.column,
    );
  }
  whileStmt(node: WhileStmt): AlgebraicExpression {
    return this.croak(`Expected an expression, but got a while-statement.`);
  }
}

/**
 * An ExpressionVisitor that transforms
 * its given {@link Expr|conventional expression} into
 * an algebraic tree.
 */
class ConventionalTree implements ExpressionVisitor<Expr> {
  map(node: Expression) {
    return node.accept(this);
  }
  int(node: Int): Expr {
    return integer(node.n);
  }
  real(node: Real): Expr {
    return float(node.n);
  }
  sym(node: Sym<string>): Expr {
    return variable(Token.of(tt.variable, node.s));
  }
  constant(node: Constant<number | null, string>): Expr {
    if (isConstant(node)) {
      switch (node.c) {
        case "pi":
          return numericConstant(PI, "pi");
        case "e":
          return numericConstant(E, "e");
        case "NAN":
          return numericConstant(NaN, "NAN");
        case "Inf":
          return numericConstant(Infinity, "Inf");
        default:
          return float(node.value);
      }
    }
    return nil();
  }
  sum(node: Sum): Expr {
    const args = node.args;
    if (args.length === 1) {
      const arg = this.map(args[0]);
      return algebraicUnary(Token.of(tt.plus, "+"), arg);
    } else if (args.length === 2) {
      let left = this.map(args[0]);
      left = args[0].hasParens() ? grouped(left) : left;
      let right = this.map(args[1]);
      right = args[1].hasParens() ? grouped(right) : right;
      return binex(left, Token.of(tt.plus, "+"), right);
    } else {
      let left = this.map(args[0]);
      for (let i = 1; i < args.length; i++) {
        let right = this.map(args[i]);
        right = args[1].hasParens() ? grouped(right) : right;
        left = binex(left, Token.of(tt.plus, "+"), right);
      }
      return left;
    }
  }
  product(node: Product): Expr {
    const args = node.args;
    if (args.length === 1) {
      const arg = this.map(args[0]);
      return arg;
    } else if (args.length === 2) {
      let left = this.map(args[0]);
      left = args[0].hasParens() ? grouped(left) : left;
      let right = this.map(args[1]);
      right = args[1].hasParens() ? grouped(right) : right;
      return binex(left, Token.of(tt.star, "*"), right);
    } else {
      let left = this.map(args[0]);
      for (let i = 1; i < args.length; i++) {
        let right = this.map(args[i]);
        right = args[1].hasParens() ? grouped(right) : right;
        left = binex(left, Token.of(tt.star, "*"), right);
      }
      return left;
    }
  }
  quotient(node: Quotient): Expr {
    const left = this.map(node.dividend);
    const right = this.map(node.divisor);
    return binex(left, Token.of(tt.slash, "/"), right);
  }
  fraction(node: Fraction): Expr {
    const N = node.numerator.n;
    const D = node.denominator.n;
    return rational(N, D);
  }
  power(node: Power): Expr {
    const base = this.map(node.base);
    const exponent = this.map(node.exponent);
    return binex(base, Token.of(tt.caret, "^"), exponent);
  }
  difference(node: Difference): Expr {
    const left = this.map(node.left);
    const right = this.map(node.right);
    return binex(left, Token.of(tt.minus, "-"), right);
  }
  factorial(node: Factorial): Expr {
    const arg = this.map(node.arg);
    return nativeCall("!", [arg], location(0, 0));
  }
  algebraicFn(node: AlgebraicFn): Expr {
    const name = node.op;
    const args = node.args.map((n) => this.map(n));
    const N = Token.of(tt.variable, name);
    return call(variable(N), args, location(0, 0));
  }
}

/**
 * Given the {@link Expr|expr node}, returns
 * the node in algebraic tree form.
 */
function algebraicTree(node: Expr) {
  const tree = new AlgebraicTree();
  try {
    const out = tree.map(node);
    return right(out);
  } catch (error) {
    return left(error as Err);
  }
}

/**
 * Given the {@link Expression|expression node},
 * returns the expression in conventional tree
 * form.
 */
function conventialTree(node: Expression) {
  return new ConventionalTree().map(node);
}

const src = `
let x = (1,2,3,4);
`;
const lexemes = lexicalAnalysis(src).map(symsplit).map(imul);
// print(lexemes);
const parsing = syntaxAnalysis(lexemes);
print(treeof(parsing));
// const x = sum([int(2), int(3), product([sym("x"), sym("y")])]);
// const g = conventialTree(x);
// const h = algebraicTree(g);
// print(g);
// print(h);
