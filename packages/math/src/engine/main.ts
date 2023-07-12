// § - Utility functions.
/**
 * Utility function for printing the AST.
 */
export function astLog<T extends Object>(
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
      line += prefix(key, last) + key.toString();
      if (root instanceof Expr) {
        root.kind = nk[root.kind] as any;
        root.type = nt[root.type] as any;
      } else if (root instanceof Stmt) {
        root.kind = nk[root.kind] as any;
        root.type = nt[root.type] as any;
      } else if (root instanceof Token) {
        root.type = tt[root.type] as any;
      }
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
type Program = {
  nodes: ASTNode[];
  error: string | null;
};
const prog = (nodes: ASTNode[], error: string | null): Program => ({
  nodes,
  error,
});

/**
 * Utility function for generating ranges..
 */
const range = (start: number, stop: number, step = 1): number[] =>
  Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) =>
    x + y * step
  );

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

/**
 * Returns true if the given character is an ASCII digit.
 */
const isDigit = (c: string) => ("0" <= c && c <= "9");

/**
 * Return true if the given character is a whitespace character
 * (either a single space, a `\r`, a `\t`, or a `\n`).
 */
const isws = (c: string) => (
  c === " " || c === "\r" || c === "\t" || c === "\n"
);

/**
 * Returns true if the given character is a greek letter name.
 */
const isGreekLetterName = (c: string) => (
  /^(alpha|beta|gamma|delta|epsilon|zeta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|upsilon|phi|chi|psi|omega)/
    .test(c.toLowerCase())
);

/**
 * Returns true if the given character is a Latin or Greek
 * character.
 */
const isLatinGreek = (c: string) => (
  /^[a-zA-Z]/.test(c)
);

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

class Err {
  message: string;
  constructor(message: string) {
    this.message = message;
  }
}
const err = (message: string) => new Err(message);

// § - Token type enum.
// deno-fmt-ignore
enum tt {
	empty, eof, error,
  
  // Punctuation tokens
  lparen, rparen,
  lbrace, rbrace, 
  lbrack, rbrack,
  comma, dot, semicolon,
  dquote, quote,

  /**
   * A tilde token indicates to the parser
   * that this particular string maps to an
   * algebraic expression.
   */
  tilde, 
	
  // Operator Tokens
  minus, plus, slash,
  caret, star,
  bang,
  percent, eq, deq, neq, lt, gt, leq, geq,

  

	rem, mod, div, call,

  sym, str, int, float,
  complex,
  scinum,
  
  // keywords
  let,print,fn,
  for, while, is,
  return,if,else,struct,

  // nil = null
  nil,

  // boolean keywords
  true, false,

  // number constant keywords
  nan, inf,

  // logical operators
  and, nand, not, or, nor,
  xor, xnor,
}

// § - Binding power enum.
export enum bp {
  nil,
  lowest,
  assign,
  atom,
  list,
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
  prod,
  quot,
  pow,
  postfix,
  call,
}

// § - Token Class
class Token {
  type: tt;
  lex: string;
  constructor(type: tt, lex: string) {
    this.type = type;
    this.lex = lex;
  }
  map<K>(callback: (token: Token) => K) {
    return callback(this);
  }
  is(type: tt) {
    return this.type === type;
  }
  isnum() {
    return (
      (this.type === tt.int) ||
      (this.type === tt.float) ||
      (this.type === tt.scinum)
    );
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.is(types[i])) return true;
    }
    return false;
  }
}

class ComplexToken extends Token {
  r: number;
  i: number;
  constructor(r: number, i: number, op: "-" | "+") {
    super(tt.complex, [r, op, i, "i"].join(""));
    this.r = r;
    this.i = i;
  }
}
const cpxTkn = (r: number, op: "-" | "+", i: number) => (
  new ComplexToken(r, i, op)
);
const isCpxTkn = (t: Token): t is ComplexToken => (
  t.type === tt.complex
);

/**
 * Returns a new token.
 */
const tk = (type: tt, lex: string) => (
  new Token(type, lex)
);

/**
 * Returns the array of tokens stringified.
 */
const tokenlist = (tokens: Token[], raw:boolean=true) => (
  tokens.map((t) => (raw ? '' : `${tt[t.type]}`) + `${t.lex}`)
);

// § - Node Type Enum
/**
 * A enum value corresponding to the node’s type.
 * The JavaScript `instanceof` operator should
 * __never__ be used when checking node types because
 * of how the nodes are subclassed.
 */
// deno-fmt-ignore
enum nt {
  assign, binex, call, group,
  int, float, rational, string,
  sym, unex, algebra, nil,
  tuple, vector, matrix,
  complex, bool,
  
  block,expression,fn,predicate,
  return,vardef,loop,
}

// § - Visitor Definition
interface Visitor<T> {
  // --- Nodes that cannot recur during the tree walk (i.e., base cases). --
  int(node: IntegerLiteral): T;
  float(node: FloatLiteral): T;
  complex(node: ComplexLiteral): T;
  nil(node: NullLiteral): T;
  rational(node: RationalLiteral): T;
  string(node: StringLiteral): T;
  sym(node: SymbolLiteral): T;
  bool(node: BooleanLiteral): T;

  // -- Nodes that should ultimately reduce to base cases. --

  assign(node: AssignExpr): T;
  binex(node: BinaryExpr): T;
  unex(node: UnaryExpr): T;
  call(node: CallExpr): T;
  group(node: GroupExpr): T;
  vector(node: VectorExpr): T;
  matrix(node: MatrixExpr): T;
  tuple(node: TupleExpr): T;
  algebra(node: AlgebraExpr): T;

  // --- All nodes after this line are statements ---

  block(node: BlockStmt): T;
  expression(node: ExprStmt): T;
  fn(node: FunctionStmt): T;
  predicate(node: ConditionalStmt): T;
  returnStmt(node: ReturnStmt): T;
  vardef(node: VarDefStmt): T;
  loop(node: LoopStmt): T;
}

// § - Node Kind Enum
/**
 * Enum corresponding to the node’s kind.
 * All nodes are either statements (`stmt`)
 * or expressions (`expr`).
 */
enum nk {
  stmt,
  expr,
}

// § - ASTNode
/**
 * All statements and expressions
 * are extensions of the abstract
 * class ASTNode. This class ensures
 * that every node has a `kind` (for
 * distinguishing between statements
 * and expressions quickly) and a `type`
 * (the node’s specific type).
 */
abstract class ASTNode {
  kind: nk;
  type: nt;
  constructor(kind: nk, type: nt) {
    this.kind = kind;
    this.type = type;
  }
  abstract accept<T>(visitor: Visitor<T>): T;
}

// § - Node Definitions
abstract class Expr extends ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  constructor(type: nt) {
    super(nk.expr, type);
    this.type = type;
  }
}

// § - Boolean Node

class BooleanLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }
  value: boolean;
  constructor(value: boolean) {
    super(nt.bool);
    this.value = value;
  }
}
const bool = (value: boolean) => (
  new BooleanLiteral(value)
);

// § - Assigment Node.
class AssignExpr extends Expr {
  name: Token;
  value: Expr;
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assign(this);
  }
  constructor(name: Token, value: Expr) {
    super(nt.assign);
    this.name = name;
    this.value = value;
  }
}
const assign = (name: Token, value: Expr) => (
  new AssignExpr(name, value)
);

class AlgebraExpr extends Expr {
  expr: Expr;
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebra(this);
  }
  constructor(expr: Expr) {
    super(nt.algebra);
    this.expr = expr;
  }
}

const algebra = (expr: Expr) => (
  new AlgebraExpr(expr)
);

// § - Binary Expression Node.
class BinaryExpr extends Expr {
  left: Expr;
  op: Token;
  right: Expr;
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binex(this);
  }
  constructor(left: Expr, op: Token, right: Expr) {
    super(nt.binex);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

const binex = (left: Expr, op: Token, right: Expr) => (
  new BinaryExpr(left, op, right)
);

// § - Unary Expression Node.
class UnaryExpr extends Expr {
  op: Token;
  arg: Expr;
  accept<T>(visitor: Visitor<T>): T {
    return visitor.unex(this);
  }
  constructor(op: Token, arg: Expr) {
    super(nt.unex);
    this.op = op;
    this.arg = arg;
  }
}

const unex = (op: Token, arg: Expr) => (
  new UnaryExpr(op, arg)
);

// § - Call Node
class CallExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.call(this);
  }
  callee: Expr;
  args: Expr[];
  constructor(callee: Expr, args: Expr[]) {
    super(nt.call);
    this.callee = callee;
    this.args = args;
  }
}

const call = (callee: Expr, args: Expr[]) => (
  new CallExpr(callee, args)
);

// § - Group Node
class GroupExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.group(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(nt.group);
    this.expr = expr;
  }
}

const group = (expr: Expr) => (
  new GroupExpr(expr)
);

//§ - Nil Node
class NullLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }
  value: null = null;
  constructor() {
    super(nt.nil);
  }
}
const nil = () => (
  new NullLiteral()
);

// § - Int Node
class IntegerLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.int(this);
  }
  value: number;
  constructor(value: number) {
    super(nt.int);
    this.value = value;
  }
}
const int = (value: number | string) => (
  new IntegerLiteral(typeof value === "string" ? +value : value)
);
const isint = (node: ASTNode): node is IntegerLiteral => (
  node.type === nt.int
);

// § - Float Node
class FloatLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.float(this);
  }
  value: number;
  constructor(value: number) {
    super(nt.float);
    this.value = value;
  }
}
const float = (value: number | string) => (
  new FloatLiteral(typeof value === "string" ? +value : value)
);

// § - Rational Node
class RationalLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.rational(this);
  }
  N: number;
  D: number;
  constructor(N: number, D: number) {
    super(nt.rational);
    this.N = N;
    this.D = D;
  }
}
const rational = (N: number, D: number) => (
  new RationalLiteral(N, D)
);

// § - String Node
class StringLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.string(this);
  }
  value: string;
  constructor(value: string) {
    super(nt.string);
    this.value = value;
  }
}

const str = (value: string) => (
  new StringLiteral(value)
);

// § - Symbol Node
class SymbolLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.sym(this);
  }
  name: Token;
  constructor(name: Token) {
    super(nt.sym);
    this.name = name;
  }
}
const isSym = (node: ASTNode): node is SymbolLiteral => (
  node.type === nt.sym
);

const sym = (t: Token) => (
  new SymbolLiteral(t)
);

// § Stmt Type
abstract class Stmt extends ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  constructor(type: nt) {
    super(nk.stmt, type);
    this.type = type;
  }
}

// § Block Statement
class BlockStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.block(this);
  }
  stmts: Stmt[];
  constructor(stmts: Stmt[]) {
    super(nt.block);
    this.stmts = stmts;
  }
}

const block = (stmts: Stmt[]) => (
  new BlockStmt(stmts)
);

//§ - Expression Statement
class ExprStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.expression(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(nt.expression);
    this.expression = expression;
  }
}

const expression = (expr: Expr) => (
  new ExprStmt(expr)
);
const isexpression = (node: ASTNode): node is ExprStmt => (
  node.type === nt.expression
);

// § - Function Declaration Statement
class FunctionStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fn(this);
  }
  name: Token;
  params: Token[];
  body: Stmt[];
  constructor(name: Token, params: Token[], body: Stmt[]) {
    super(nt.fn);
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

const fn = (name: Token, params: Token[], body: Stmt[]) => (
  new FunctionStmt(name, params, body)
);

// § - Predicate Statement
class ConditionalStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.predicate(this);
  }
  condition: Expr;
  thenBranch: BlockStmt;
  elseBranch: BlockStmt;
  constructor(condition: Expr, thenBranch: BlockStmt, elseBranch: BlockStmt) {
    super(nt.predicate);
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

const predicate = (cond: Expr, thenB: BlockStmt, elseB: BlockStmt) => (
  new ConditionalStmt(cond, thenB, elseB)
);

//§ - Return statement node
class ReturnStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.returnStmt(this);
  }
  value: Expr;
  constructor(value: Expr) {
    super(nt.return);
    this.value = value;
  }
}

const returnStmt = (value: Expr) => (
  new ReturnStmt(value)
);

// § - Variable Definition
class VarDefStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vardef(this);
  }
  name: Token;
  init: Expr;
  constructor(name: Token, init: Expr) {
    super(nt.vardef);
    this.name = name;
    this.init = init;
  }
}

const vardef = (name: Token, init: Expr) => (
  new VarDefStmt(name, init)
);

class VectorExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vector(this);
  }
  elements: Expr[];
  constructor(elements: Expr[]) {
    super(nt.vector);
    this.elements = elements;
  }
}

const vectorExpr = (elements: Expr[]) => (
  new VectorExpr(elements)
);
const isvector = (node: ASTNode): node is VectorExpr => (
  node.type === nt.vector
);

class MatrixExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.matrix(this);
  }
  elements: VectorExpr[];
  rows: number;
  cols: number;
  constructor(elements: VectorExpr[], rows: number, cols: number) {
    super(nt.matrix);
    this.elements = elements;
    this.rows = rows;
    this.cols = cols;
  }
}

const matrixExpr = (elements: VectorExpr[], rows: number, cols: number) => (
  new MatrixExpr(elements, rows, cols)
);

class ComplexLiteral extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.complex(this);
  }
  r: number;
  i: number;
  constructor(r: number, i: number) {
    super(nt.complex);
    this.r = r;
    this.i = i;
  }
}
const complex = (r: number, i: number) => (
  new ComplexLiteral(r, i)
);

class TupleExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tuple(this);
  }
  items: Expr[];
  constructor(items: Expr[]) {
    super(nt.tuple);
    this.items = items;
  }
}
const tuple = (items: Expr[]) => (
  new TupleExpr(items)
);

//§ - Loop Statement
class LoopStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loop(this);
  }
  condition: Expr;
  body: Stmt;
  constructor(condition: Expr, body: Stmt) {
    super(nt.loop);
    this.condition = condition;
    this.body = body;
  }
}

const loop = (cond: Expr, body: Stmt) => (
  new LoopStmt(cond, body)
);

const splittable = (t: Token) => (
  t.is(tt.sym) && !isGreekLetterName(t.lex) && !t.lex.includes("_")
);
const symsplit = (tokens: Token[]) => (
  tokens.map((t) =>
    splittable(t) ? t.lex.split("").map((c) => (tk(tt.sym, c))) : t
  ).flat()
);

// § - Scanning: Implicit Multiplication
const imul = (tkns: Token[]) => {
  const STAR = tk(tt.star, "*");
  const out: Token[] = [];
  const tokens = zip(tkns, tkns.slice(1));
  for (let i = 0; i < tokens.length; i++) {
    const [now, nxt] = tokens[i];
    out.push(now);
    if (now.is(tt.rparen)) {
      if (nxt.is(tt.sym)) {
        out.push(STAR);
      } else if (nxt.is(tt.lparen)) {
        out.push(STAR);
      }
    } else if (now.isnum() && nxt.is(tt.call)) {
      out.push(STAR);
    } else if (now.isnum() && nxt.is(tt.sym)) {
      out.push(STAR);
    } else if (now.isnum() && nxt.is(tt.lparen)) {
      out.push(STAR);
    } else if (now.is(tt.sym) && nxt.is(tt.sym)) {
      out.push(STAR);
    }
  }
  return out;
};

// § - Tokenize Function
const tokenize = (text: string) => {
  let start = 0;
  let current = 0;
  let status_ok = true;
  const atEnd = () => (current >= text.length) && status_ok;
  const match = (c: string) => (
    (!atEnd()) && (text[current] === c) && (current++)
  );
  const tick = () => text[current++];
  const peek = (n: number) => text[current + n];
  const str = () => text.slice(start, current);
  const newtkn = (type: tt, str: string = "") => {
    const lex = str ? str : text.slice(start, current);
    if (type === tt.error) {
      status_ok = false;
    }
    return tk(type, lex);
  };
  const skipws = () => {
    while (!(atEnd())) {
      if (isws(peek(0))) tick();
      else return;
    }
  };
  const digit = (init: tt.int | tt.float | tt.scinum) => {
    let type = init;
    while (isDigit(peek(0)) && !atEnd()) {
      tick();
    }
    if (peek(0) === "." && isDigit(peek(1))) {
      tick();
      type = tt.float;
      while (isDigit(peek(0))) tick();
    }
    // if (peek(0) === "E") {
    if (peek(0) === "E") {
      const c = peek(1);
      if (isDigit(c)) {
        type = tt.scinum;
        tick(); // eat the 'E'
        while (isDigit(peek(0))) tick();
      } else if (c === "+" || c === "-") {
        type = tt.scinum;
        if (isDigit(peek(2))) {
          tick(); // eat the '+' or '-'
          tick(); // eat the number
          while (isDigit(peek(0))) tick();
        }
      }
    }

    return newtkn(type);
  };
  const string = (type: tt.str | tt.tilde) => {
    const delimiter = type === tt.str ? `"` : `~`;
    while (peek(0) !== delimiter && !atEnd()) {
      tick();
    }
    if (atEnd()) return newtkn(tt.error, `Unterminated string.`);
    tick();
    const s = str().slice(1, -1);
    return newtkn(type, s);
  };
  const sym = () => {
    while (
      (isLatinGreek(peek(0)) || isDigit(peek(0))) && !atEnd()
    ) {
      tick();
    }
    const s = str();
    // deno-fmt-ignore
    switch (s) {
      case 'let': return newtkn(tt.let);
      case 'fn': return newtkn(tt.fn);
      case 'and': return newtkn(tt.and);
      case 'nand': return newtkn(tt.nand);
      case 'not': return newtkn(tt.not);
      case 'or': return newtkn(tt.or);
      case 'nor': return newtkn(tt.nor);
      case 'xor': return newtkn(tt.xor);
      case 'xnor': return newtkn(tt.xnor);
      case 'for': return newtkn(tt.for);
      case 'while': return newtkn(tt.while);
      case 'is': return newtkn(tt.is);
      case 'return': return newtkn(tt.return);
      case 'inf': return newtkn(tt.inf);
      case 'nan': return newtkn(tt.nan);
      case 'nil': return newtkn(tt.nil);
      case 'if': return newtkn(tt.if);
      case 'else': return newtkn(tt.else);
      case 'struct': return newtkn(tt.struct);
      case "rem": return newtkn(tt.rem);
      case "mod": return newtkn(tt.mod);
      case "div": return newtkn(tt.div);
			case 'sin':
			case 'cos':
			case 'tan': return newtkn(tt.call);
    }
    return newtkn(tt.sym);
  };

  const scan = () => {
    skipws();
    start = current;
    if (atEnd()) return newtkn(tt.eof, "EOF");
    const c = tick();
    if (isLatinGreek(c)) return sym();
    if (isDigit(c)) return digit(tt.int);
    if (c === "." && isDigit(peek(1))) return digit(tt.float);
    // deno-fmt-ignore
    switch (c) {
			case '(': return newtkn(tt.lparen);
			case ')': return newtkn(tt.rparen);
			case '{': return newtkn(tt.lbrace);
			case '}': return newtkn(tt.rbrace);
			case '[': return newtkn(tt.lbrack);
			case ']': return newtkn(tt.rbrack);
			case ',': return newtkn(tt.comma);
			case '-': return newtkn(tt.minus);
			case '+': return newtkn(tt.plus);
			case '^': return newtkn(tt.caret);
			case '*': return newtkn(tt.star);
			case '/': return newtkn(tt.slash);
			case '%': return newtkn(tt.percent);
			case ';': return newtkn(tt.semicolon);
			case `'`: return newtkn(tt.quote);
			case '!': return newtkn(match('=') ? tt.neq : tt.bang);
			case '=': return newtkn(match('=') ? tt.deq : tt.eq);
			case '<': return newtkn(match('=') ? tt.leq : tt.lt);
			case '>': return newtkn(match('=') ? tt.geq : tt.gt);
      case `"`: return string(tt.str);
			case '~': return string(tt.tilde);
		}
    return newtkn(tt.error, `unknown token [${c}]`);
  };

  const tokenize = () => {
    let i = 0;
    const out: Token[] = [];
    while (current < text.length) {
      const t = scan();
      if (t.is(tt.eof)) break;
      out.push(t);
      i++;
    }
    out.push(tk(tt.eof, "EOF"));

    // second pass - remove trailing commas
    const out2: Token[] = [];
    for (let i = 0; i < out.length; i++) {
      const t = out[i];
      const nxt = out[i + 1];
      const nxt2 = out[i + 2];
      const nxt3 = out[i + 3];
      if (
        nxt !== undefined && t.is(tt.comma) &&
        (nxt.is(tt.rparen) || nxt.is(tt.rbrack))
      ) {
        continue;
      }
      if (t.among([tt.float, tt.int])) {
        if (nxt && nxt.among([tt.plus, tt.minus])) {
          if (nxt2 && nxt2.among([tt.float, tt.int])) {
            if (nxt3 && nxt3.lex === "i") {
              const real = +t.lex;
              const img = +nxt2.lex;
              const op = nxt.lex === "-" ? "-" : "+";
              out2.push(cpxTkn(real, op, img));
              i += 3;
              continue;
            }
          }
        }
      }
      out2.push(t);
    }
    return out2;
  };
  return imul(tokenize());
};

type Parslet = (
  current: Token,
  lastNode: Expr,
  prev: Token,
  peek: Token,
) => Either<Err, Expr>;
type PSpec = Record<tt, [Parslet, Parslet, bp]>;

const isExpr = (node: ASTNode): node is Expr => (
  node.kind === nk.expr
);
const isStmt = (node: ASTNode): node is Stmt => (
  node.kind === nk.stmt
);

class State {
  tokens: Token[];
  i: number = 0;
  error: Err | null = null;
  peek: Token = tk(tt.empty, "");
  prev: Token = tk(tt.empty, "");
  lastnode: ASTNode = nil();
  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.peek = tokens[0] ? tokens[0] : tk(tt.empty, "");
    if (!this.tokens[tokens.length - 1].is(tt.eof)) {
      this.tokens.push(tk(tt.eof, "eof"));
    }
  }
  tickIfNextIs(type: tt) {
    if (this.peek.is(type)) {
      this.next();
    }
    return this;
  }
  peekIsNot<K>(tokenType: tt, callback: (token: Token) => K) {
    if (!this.peek.is(tokenType)) {
      callback(this.peek);
    }
  }
  peekIs<K>(tokenType: tt, callback: (token: Token) => K) {
    if (this.peek.is(tokenType)) {
      callback(this.peek);
    }
  }
  lookahead(index: number) {
    const out = this.tokens[this.i + index];
    if (out) return out;
    return tk(tt.eof, "EOF");
  }
  lastParsed(node: ASTNode) {
    this.lastnode = node;
    return this;
  }
  /**
   * Executes the callback function if the next
   * token matches the provided token type. Otherwise,
   * executes the else function.
   */
  ifNextIs<A, B>(
    tokenType: tt,
    callback: (token: Token) => A,
    elsefn: (token: Token) => B,
  ) {
    if (this.peek.is(tokenType)) {
      const t = this.next();
      return callback(t);
    } else return elsefn(this.prev);
  }
  check(type: tt) {
    if (this.atEnd()) return false;
    return this.peek.is(type);
  }
  /**
   * If the given type matches
   * the upcoming token (the peek),
   * moves the state forward. Otherwise,
   * leaves the state as is.
   */
  nextIs(type: tt) {
    if (this.peek.is(type)) {
      this.next();
      return true;
    }
    return false;
  }
  /**
   * Moves the state forward.
   */
  next() {
    if (!this.atEnd()) this.i++;
    const prev = this.peek;
    this.prev = prev;
    const newtoken = this.tokens[this.i]
      ? this.tokens[this.i]
      : tk(tt.eof, "EOF");
    if (newtoken.is(tt.error)) {
      this.error = err(newtoken.lex);
    }
    this.peek = newtoken;
    return prev;
  }
  ok<T extends ASTNode>(node: T) {
    this.lastParsed(node);
    return right(node);
  }
  err(error: string, source: string) {
    this.error = err(`[${source}] ${error}`);
    return left(this.error);
  }
  atEnd() {
    return (
      (this.i === this.tokens.length - 1) ||
      (this.peek.is(tt.eof)) ||
      (this.current.is(tt.eof)) ||
      (this.error !== null)
    );
  }
  get current(): Token {
    const out = this.tokens[this.i];
    if (out) return out;
    return tk(tt.error, `Unexpected end of input.`);
  }
}
const enstate = (tokens: Token[]) => (
  new State(tokens)
);

const parse = (text: string | Token[]) => {
  const state = enstate(typeof text === "string" ? tokenize(text) : text);

  const glyph = (prev: Token) => {
    if (!prev.is(tt.sym)) {
      return state.err(`Expected symbol.`, "glyph");
    }
    return state.ok(sym(prev));
  };

  const atom = (prev: Token) => {
    const type = prev.type;
    const lex = prev.lex;
    // deno-fmt-ignore
    switch (type) {
      case tt.str: return state.ok(str(lex))
      case tt.int: return state.ok(int(lex));
      case tt.inf: return state.ok(int(Infinity));
      case tt.nan: return state.ok(int(NaN));
      case tt.float: return state.ok(float(lex));
      case tt.true: return state.ok(bool(true));
      case tt.false: return state.ok(bool(false));
      case tt.nil: return state.ok(nil());
      default: return state.err(`Expected atom, got ${lex}`, 'atom');
    }
  };

  const complexNumber = (prev: Token) => {
    if (!isCpxTkn(prev)) {
      return state.err(`Unexpected complex number`, "complex");
    }
    const r = prev.r;
    const i = prev.i;
    return state.ok(complex(r, i));
  };

  const scinum = (prev: Token) => {
    if (prev.is(tt.scinum)) {
      const parts = prev.lex.split("E");
      if (parts.length === 2) {
        const [base, exponent] = parts;
        const B = Number.isInteger(+base) ? int(base) : float(base);
        const E = int(exponent);
        return state.ok(binex(B, tk(tt.caret, "^"), E));
      }
    }
    return state.err(`Expected scientific number`, "scinum");
  };

  const postfix: Parslet = (op, node) => {
    return state.ok(unex(op, node));
  };

  const prefix: Parslet = (op) => {
    const p = precof(op.type);
    return expr(p).chain((n) => state.ok(unex(op, n)));
  };

  const infix: Parslet = (op, node) => {
    const p = precof(op.type);
    return expr(p).chain((n) => {
      const out = (isint(n) && isint(node) && op.is(tt.slash))
        ? (rational(node.value, n.value))
        : (binex(node, op, n));
      return state.ok(out);
    });
  };

  const assignment: Parslet = (_, node, p) => {
    if (isSym(node)) {
      return expr().chain(
        (n) => state.ok(assign(node.name, n)),
      );
    }
    return state.err(
      `Invalid assignment target. Expected symbol, got ${p.lex}.`,
      "assignment",
    );
  };

  const primary: Parslet = () => {
    const result = expr();
    if (result.isLeft()) return result;
    if (state.nextIs(tt.comma)) {
      let elems: Expr[] = [result.unwrap()];
      if (!state.check(tt.rparen)) {
        const es = comlist();
        if (es.isLeft()) return es;
        elems.push(...es.unwrap());
      }
      if (!state.nextIs(tt.rparen)) {
        return state.err(`Expected closing right-paren`, "tuple");
      } else {
        return state.ok(tuple(elems));
      }
    }
    state.next();
    const out = result.chain((n) => state.ok(group(n)));
    return out;
  };
  
  
  const callExpression = () => {
    
  }

  const comlist = () => {
    const elements: Expr[] = [];
    do {
      const e = expr();
      if (e.isLeft()) return e;
      elements.push(e.unwrap());
    } while (state.nextIs(tt.comma));
    return right(elements);
  };

  const vector: Parslet = () => {
    const result = expr();
    if (result.isLeft()) return result;
    if (state.nextIs(tt.comma)) {
      let elems: Expr[] = [result.unwrap()];
      if (!state.check(tt.rbrack)) {
        const _es = comlist();
        if (_es.isLeft()) return _es;
        const E = _es.unwrap();
        let colcount = -1;
        E.forEach((exp) => {
          if (isvector(exp)) {
            colcount = exp.elements.length;
          }
          elems.push(exp);
        });
        if (colcount !== -1) {
          const vs: VectorExpr[] = [];
          for (let i = 0; i < elems.length; i++) {
            const exp = elems[i];
            if (!isvector(exp)) {
              return state.err(`Mixed vectors prohibited`, "vector");
            }
            if (exp.elements.length !== colcount) {
              return state.err(`Jagged vectors prohibited`, "vector");
            }
            vs.push(exp);
          }
          state.next();
          return state.ok(matrixExpr(vs, elems.length, colcount));
        }
      }
      if (!state.nextIs(tt.rbrack)) {
        return state.err(`Expected closing right-bracket`, "vector");
      }
      return state.ok(vectorExpr(elems));
    }
    state.next();
    const out = state.ok(vectorExpr([result.unwrap()]));
    return out;
  };

  const nativeCall = (name: Token) => {
    const out = state.ifNextIs(tt.lparen, () => {
      const args: Expr[] = [];
      state.peekIsNot(tt.rparen, () => {
        do {
          const node = expr();
          if (node.isLeft()) return node;
          const n = node.unwrap();
          if (isExpr(n)) args.push(n);
        } while (state.nextIs(tt.comma));
      });
      return state.ifNextIs(
        tt.rparen,
        () => state.ok(call(sym(name), args)),
        () => state.err(`Expected “)”`, "nativeCall"),
      );
    }, () => state.err(`Expected “(”`, "nativeCall"));
    return out;
  };

  const algebraString = (token: Token) => {
    const src = `algebraString`;
    if (!token.is(tt.tilde)) {
      return state.err(`Unexpected algebra production`, src);
    }
    const s = token.lex;
    const ts = tokenize(s);
    const tokens: Token[] = [];
    for (let i = 0; i < ts.length; i++) {
      const t = ts[i];
      if (t.is(tt.eq)) {
        tokens.push(tk(tt.deq, "=="));
      } else {
        tokens.push(t);
      }
    }
    tokens.push(tk(tt.eof, "EOF"));
    const tidyTokens = imul(symsplit(tokens));
    const n = parse(tidyTokens);
    if (n.error !== null) {
      return state.err(n.error, "algebra");
    }
    if (n.nodes.length === 0) {
      return state.err(`Empty algebra string`, src);
    }
    const [node] = n.nodes;
    if (!isexpression(node)) {
      return state.err(`Non-expression algebra string`, src);
    }
    const out = algebra(node.expression);
    return state.ok(out);
  };

  const __o = bp.nil;
  const __ = (t: Token) => {
    const msg = `Expected an expression, but got: “${t.lex}”`;
    const e = err(msg);
    return left(e);
  };

  const rules: PSpec = {
    [tt.empty]: [__, __, __o],
    [tt.eof]: [__, __, __o],
    [tt.semicolon]: [__, __, __o],
    [tt.if]: [__, __, __o],
    [tt.else]: [__, __, __o],
    [tt.struct]: [__, __, __o],
    [tt.error]: [__, __, __o],
    [tt.dquote]: [__, __, __o],
    [tt.quote]: [__, __, __o],
    [tt.lparen]: [primary, __, bp.call],
    [tt.rparen]: [__, __, __o],
    [tt.lbrace]: [__, __, __o],
    [tt.lbrack]: [vector, __, bp.list],
    [tt.rbrack]: [__, __, __o],
    [tt.rbrace]: [__, __, __o],
    [tt.comma]: [__, __, __o],
    [tt.dot]: [__, __, __o],
    [tt.complex]: [complexNumber, __, bp.atom],
    [tt.minus]: [prefix, infix, bp.sum],
    [tt.plus]: [prefix, infix, bp.sum],
    [tt.caret]: [__, infix, bp.pow],
    [tt.slash]: [__, infix, bp.prod],
    [tt.star]: [__, infix, bp.prod],
    [tt.rem]: [__, infix, bp.quot],
    [tt.mod]: [__, infix, bp.quot],
    [tt.div]: [__, infix, bp.quot],
    [tt.percent]: [__, infix, bp.quot],
    [tt.bang]: [__, postfix, bp.postfix],
    [tt.and]: [__, infix, bp.and],
    [tt.nand]: [__, infix, bp.nand],
    [tt.not]: [prefix, __, bp.not],
    [tt.or]: [__, infix, bp.or],
    [tt.nor]: [__, infix, bp.nor],
    [tt.xor]: [__, infix, bp.xor],
    [tt.xnor]: [__, infix, bp.xnor],
    [tt.eq]: [__, assignment, bp.assign],
    [tt.deq]: [__, infix, bp.eq],
    [tt.neq]: [__, infix, bp.rel],
    [tt.lt]: [__, infix, bp.rel],
    [tt.gt]: [__, infix, bp.rel],
    [tt.leq]: [__, infix, bp.rel],
    [tt.geq]: [__, infix, bp.rel],
    [tt.sym]: [glyph, __, bp.atom],
    [tt.str]: [atom, __, bp.atom],
    [tt.int]: [atom, __, bp.atom],
    [tt.float]: [atom, __, bp.atom],
    [tt.scinum]: [scinum, __, bp.atom],
    [tt.true]: [atom, __, bp.atom],
    [tt.false]: [atom, __, bp.atom],
    [tt.nan]: [atom, __, bp.atom],
    [tt.inf]: [atom, __, bp.atom],
    [tt.nil]: [atom, __, bp.atom],
    [tt.call]: [nativeCall, __, bp.call],
    [tt.tilde]: [algebraString, __, __o],
    [tt.let]: [__, __, __o],
    [tt.print]: [__, __, __o],
    [tt.fn]: [__, __, __o],
    [tt.for]: [__, __, __o],
    [tt.while]: [__, __, __o],
    [tt.is]: [__, __, __o],
    [tt.return]: [__, __, __o],
  };
  const prefixRule = (t: tt) => (
    rules[t][0]
  );
  const infixRule = (t: tt) => (
    rules[t][1]
  );
  const precof = (t: tt) => (
    rules[t][2]
  );

  const expr = (minbp: bp = bp.lowest): Left<Err> | Right<Expr> => {
    let prev = state.prev;
    let token = state.next();
    let peek = state.peek;
    const pre = prefixRule(token.type);
    let lhs = pre(token, nil(), prev, peek);
    if (lhs.isLeft()) return lhs;
    while (minbp < precof(state.peek.type)) {
      if (state.atEnd()) break;
      prev = token;
      token = state.next();
      peek = state.peek;
      const r = infixRule(token.type);
      const rhs = r(token, lhs.unwrap(), prev, peek);
      if (rhs.isLeft()) return rhs;
      lhs = rhs;
    }
    return lhs;
  };

  const EXPR = () => {
    const out = expr();
    if (out.isLeft()) return out;
    if (
      state.nextIs(tt.semicolon) ||
      state.peek.is(tt.eof) ||
      state.peek.is(tt.rbrace) ||
      state.prev.is(tt.semicolon) ||
      state.atEnd()
    ) {
      return state.ok(expression(out.unwrap()));
    }
    return state.err(`Expected expression`, "EXPR");
  };

  const LET = () => {
    // deno-fmt-ignore
    const out = state.ifNextIs(
      tt.sym,
      (s) => state.ifNextIs(
          tt.eq,
          () => {
            const out = expr().chain((x) =>
              !isExpr(x)
                ? state.err(`Expected valid rhs`, "LET")
                : state.ok(vardef(s, x))
            );
            return out;
          },
          (t) => right(vardef(t, nil())),
        ),
      () => state.err(`Expected identifier`, "LET"),
    );
    state.tickIfNextIs(tt.semicolon);
    return out;
  };
  
  

  const WHILE = () => {
  };

  const PREDICATE = () => {
    const cond = expr();
    const src = `predicate`;
    if (cond.isLeft()) return cond;
    if (!state.nextIs(tt.lbrace)) {
      const msg = `Expected block after if-condition.`;
      return state.err(msg, src);
    }
    const ifblock = BLOCK();
    if (ifblock.isLeft()) return ifblock;
    let elseblock = block([returnStmt(nil())]);
    if (state.nextIs(tt.else)) {
      if (!state.nextIs(tt.lbrace)) {
        const msg = `Expected block after else-condition`;
        return state.err(msg, src);
      }
      const b = BLOCK();
      if (b.isLeft()) return b;
      elseblock = b.unwrap();
    }
    return state.ok(predicate(cond.unwrap(), ifblock.unwrap(), elseblock));
  };

  const BLOCK = () => {
    const stmts: Stmt[] = [];
    while (!state.check(tt.rbrace) && !state.atEnd()) {
      const s = STMT();
      if (s.isLeft()) return s;
      stmts.push(s.unwrap());
    }
    return state.ifNextIs(
      tt.rbrace,
      () => state.ok(block(stmts)),
      () => state.err(`Expected closing left brace`, "block"),
    );
  };

  const STMT = (): Left<Err> | Right<Stmt> => {
    if (state.nextIs(tt.let)) return LET();
    if (state.nextIs(tt.lbrace)) return BLOCK();
    if (state.nextIs(tt.if)) return PREDICATE();
    return EXPR();
  };

  const run = () => {
    let out: ASTNode[] = [];
    while (!state.atEnd()) {
      const n = STMT();
      if (n.isRight()) {
        out.push(n.unwrap());
      } else {
        const out = n.unwrap();
        return prog([], out.message);
      }
    }
    return prog(out, null);
  };
  return run();
};

/**
 * Converts the provided number into a pair of integers (N,D),
 * where `N` is the numerator and `D` is the
 * denominator.
 */
const toFrac = (numberValue: number): Frac => {
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
  return [h, k, "frac"];
};

/**
 * Returns the greatest common denominator
 * of the provided integers `a` and `b`.
 */
const gcd = (a: number, b: number) => {
  a = Math.floor(a);
  b = Math.floor(b);
  let t = a;
  while (b !== 0) {
    t = b;
    b = a % b;
    a = t;
  }
  return a;
};

/**
 * Given a numerator `N` and a denominator `D`,
 * returns a simplified fraction.
 */
const simplify = ([N, D]: Frac): Frac => {
  const sgn = Math.sign(N) * Math.sign(D);
  const n = Math.abs(N);
  const d = Math.abs(D);
  const f = gcd(n, d);
  return [(sgn * n) / f, d / f, "frac"];
};

type PairName = "frac" | "complex";
type Pair<N extends PairName> = [number, number, N];

type PairRel = (
  a: number,
  b: number,
  c: number,
  d: number,
) => boolean;
// deno-fmt-ignore
const prel = <N extends PairName>(op: PairRel) => (
  [n1, d1]: Pair<N>,
  [n2, d2]: Pair<N>,
): boolean => op(n1, d1, n2, d2);

type PairBinop = (
  a: number,
  b: number,
  c: number,
  d: number,
) => [number, number];
type Frac = Pair<"frac">;
type Cpx = Pair<"complex">;

// deno-fmt-ignore
const pbinop = <N extends PairName>(op: PairBinop, kind: N) => (
  [n1, d1]: Pair<N>,
  [n2, d2]: Pair<N>,
): Pair<N> => [...op(n1, d1, n2, d2), kind];

const frac = (a: number, b: number): Frac => [a, b, "frac"];
const cpx = (a: number, b: number = 0): Cpx => [a, b, "complex"];
const isnull = (n: any): n is null => n === null;
const dne = (n: any): n is undefined => n === undefined;
const unsafe = (n: any): n is null | undefined => (isnull(n) || dne(n));
const safe = (n: any) => !unsafe(n);
const isarray = (n: any) => Array.isArray(n);

const isfrac = (n: any): n is Frac => (
  safe(n) && isarray(n) && n.length === 3 && n[2] === "frac"
);
const iscpx = (n: any): n is Cpx => (
  safe(n) && isarray(n) && n.length === 3 && n[2] === "complex"
);

/**
 * Returns true if the two given fractions are equal.
 */
const equalQ = (a: Frac, b: Frac) => (
  zip(simplify(a), simplify(b)).reduce((p, [a, b]) => p && (a === b), true)
);

const cbinop = (op: PairBinop) => (a: Cpx, b: Cpx) => (
  pbinop(op, "complex")(a, b)
);

// deno-fmt-ignore
const complexStr = ([a,b]:Cpx) => (
  b === 0 ? [a,'i']
    : b > 0
    ? [a,' + ',b,'i']
    : [a,' - ',b,'i']
).join('')

const qbinop = (op: PairBinop) => (a: Frac, b: Frac) => (
  simplify(pbinop(op, "frac")(simplify(a), simplify(b)))
);
const qrel = (op: PairRel) => (a: Frac, b: Frac) => (
  prel(op)(simplify(a), simplify(b))
);

/**
 * Performs rational multiplication.
 */
const mulQ = qbinop((n1, d1, n2, d2) => [n1 * n2, d1 * d2]);

/**
 * Performs rational division.
 */
const divQ = qbinop((n1, d1, n2, d2) => [n1 * d1, d2 * n2]);
/**
 * Performs rational addition.
 */
const addQ = qbinop((n1, d1, n2, d2) => [
  n1 * d2 + n2 * d1,
  d1 * d2,
]);
/**
 * Perform rational subtraction.
 */
const subQ = qbinop((n1, d1, n2, d2) => [
  n1 * d2 - n2 * d1,
  d1 * d2,
]);

const lteQ = qrel((n1, d1, n2, d2) => n1 * d2 <= n2 * d1);
const ltQ = (a: Frac, b: Frac) => (lteQ(a, b) && !equalQ(a, b));
const gtQ = (a: Frac, b: Frac) => (!lteQ(a, b));
const gteQ = (a: Frac, b: Frac) => (gtQ(a, b) || equalQ(a, b));
const addC = cbinop((a, b, c, d) => [a + c, b + d]);
const subC = cbinop((a, b, c, d) => [a - c, b - d]);
const mulC = cbinop((a, b, c, d) => [(a * c) - (b * d), (a * d) + (b * c)]);
const makeFrac = (a: Frac | number) => (
  isfrac(a) ? a : toFrac(a)
);
const enfloat = (a: Frac) => (
  a[0] / a[1]
);
const makeCpx = (a: Cpx | number | Frac) => (
  iscpx(a) ? a : isfrac(a) ? cpx(enfloat(a)) : cpx(a)
);
const equalize = (u: number[], v: number[]): [number[], number[]] => (
  u.length === v.length
    ? [u, v]
    : (u.length > v.length
      ? [u, [...v, ...(range(0, u.length - v.length).map((_) => 0))]]
      : [v, [...u, ...(range(0, v.length - u.length).map((_) => 0))]])
);

// deno-fmt-ignore
const vbinop = (
  op: (a: number, b: number) => number, 
  eq:boolean=true,
) => (
  u: number[], v: number[]
) => (
  (([A,B]:[number[],number[]]) => A.map((n,i) => op(n,B[i])))
  (eq ? equalize(u,v) : [u,v])
);

/** Returns the component-wise sum. */
const vadd = vbinop((a, b) => a + b);

/** Returns the component-wise difference. */
const vsub = vbinop((a, b) => a - b);

/** Returns the component-wise product. */
const vmul = vbinop((a, b) => a * b);

/** Returns the dot product of the two number arrays. */
const vdot = (A: number[], B: number[]) => (
  (([a, b]: [number[], number[]]) =>
    a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n))(equalize(A, B))
);

const truthy = (value: RuntimeValue) => (
  value ? true : false
);
const isnum = (x: any): x is number => (
  typeof x === "number"
);

const cpxop = (A: Cpx, op: tt, B: Cpx) => {
  // deno-fmt-ignore
  switch (op) {
    case tt.plus: return addC(A, B);
    case tt.minus: return subC(A, B);
    case tt.star: return mulC(A, B);
    default: return cpx(0,0)
  }
};

const fracop = (A: Frac, op: tt, B: Frac) => {
  // deno-fmt-ignore
  switch (op) {
    case tt.plus: return addQ(A, B);
    case tt.minus: return subQ(A, B);
    case tt.star: return mulQ(A, B);
    case tt.slash: return divQ(A, B);
    case tt.lt: return ltQ(A, B);
    case tt.gt: return gtQ(A, B);
    case tt.leq: return lteQ(A, B);
    case tt.geq: return gteQ(A, B);
    case tt.neq: return !equalQ(A, B);
    case tt.deq: return equalQ(A, B);
    default: return frac(Infinity, Infinity);
  }
};

const numop = (x: number, op: tt, y: number) => {
  // deno-fmt-ignore
  switch (op) {
    case tt.plus: return x + y;
    case tt.minus: return x - y;
    case tt.star: return x * y;
    case tt.slash: return x / y;
    case tt.caret: return x ** y;
    case tt.mod: return ((x % y) + x) % y;
    case tt.rem: return x % y;
    case tt.lt: return x < y;
    case tt.gt: return x > y;
    case tt.leq: return x <= y;
    case tt.geq: return x >= y;
    case tt.neq: return x !== y;
    case tt.deq: return x === y;
    case tt.div: return Math.floor(x / y);
    case tt.percent: return (100 * x) / y;
    default: return 0;
  }
};

type RuntimeValue =
  | string
  | number
  | Frac
  | Cpx
  | boolean
  | string[]
  | number[]
  | boolean[]
  | null;

class Interpreter implements Visitor<RuntimeValue> {
  run(program: Program) {
    if (program.error !== null) {
      return program.error;
    }
    let out: RuntimeValue = null;
    const nodes = program.nodes;
    for (let i = 0; i < nodes.length; i++) {
      out = this.evalnode(nodes[i]);
    }
    return out;
  }
  private evalnode(node: ASTNode) {
    return node.accept(this);
  }
  bool(node: BooleanLiteral): RuntimeValue {
    return node.value;
  }
  complex(node: ComplexLiteral): RuntimeValue {
    const r = node.r;
    const i = node.i;
    return cpx(r, i);
  }
  assign(node: AssignExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  binex(node: BinaryExpr): RuntimeValue {
    const a = this.evalnode(node.left);
    const b = this.evalnode(node.right);
    if (isnum(a) && isnum(b)) return numop(a, node.op.type, b);
    if ((isfrac(a) || isnum(a)) && (isfrac(b) || isnum(b))) {
      const A = makeFrac(a);
      const B = makeFrac(b);
      return fracop(A, node.op.type, B);
    }
    if (
      (iscpx(a) || isnum(a) || isfrac(a)) &&
      (iscpx(b) || isnum(b) || isfrac(b))
    ) {
      const A = makeCpx(a);
      const B = makeCpx(b);
      return cpxop(A, node.op.type, B);
    }
    return null;
  }
  unex(node: UnaryExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  call(node: CallExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  group(node: GroupExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  vector(node: VectorExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  matrix(node: MatrixExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  int(node: IntegerLiteral): RuntimeValue {
    return node.value;
  }
  float(node: FloatLiteral): RuntimeValue {
    return node.value;
  }
  tuple(node: TupleExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  nil(node: NullLiteral): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  rational(node: RationalLiteral): RuntimeValue {
    const n = node.N;
    const d = node.D;
    return frac(n, d);
  }
  string(node: StringLiteral): RuntimeValue {
    return node.value;
  }
  sym(node: SymbolLiteral): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  algebra(node: AlgebraExpr): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  private evalblock(node: BlockStmt) {
    let out: RuntimeValue = null;
    const nodes = node.stmts;
    for (let i = 0; i < nodes.length; i++) {
      out = this.evalnode(nodes[i]);
    }
    return out;
  }
  block(node: BlockStmt): RuntimeValue {
    return this.evalblock(node);
  }
  expression(node: ExprStmt): RuntimeValue {
    return this.evalnode(node.expression);
  }
  fn(node: FunctionStmt): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  predicate(node: ConditionalStmt): RuntimeValue {
    const cond = this.evalnode(node.condition);
    if (truthy(cond)) {
      return this.evalnode(node.thenBranch);
    } else {
      return this.evalnode(node.elseBranch);
    }
  }
  returnStmt(node: ReturnStmt): RuntimeValue {
    return this.evalnode(node.value);
  }
  vardef(node: VarDefStmt): RuntimeValue {
    throw new Error("Method not implemented.");
  }
  loop(node: LoopStmt): RuntimeValue {
    throw new Error("Method not implemented.");
  }
}

const reduce = (program: Program) => (
  new Interpreter().run(program)
);

const j = tokenize(`x(a)`);
console.log(tokenlist(j));
