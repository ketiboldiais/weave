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
      let k = root;
      if (root instanceof Expr) {
        k = nt[root.type];
      } else if (root instanceof Token) {
        k = tt[root.type];
      }
      if (typeof k !== "object") line += ": " + k;
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
  /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(c)
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
   * 
   */
  backtick, 
  /**
   * An algebra token indicates to the parser
   * that this particular maps to {@link AlgebraToken},
   * which in turn indicates that the corresponding
   * node should be treated as a pure algebraic expression.
   */
  algebra,

	
  // Operator Tokens
  minus, plus, slash,
  caret, star, bang,
  percent, eq, deq, neq, lt, gt, leq, geq,

  

	rem, mod, div, call,

  sym, str, int, float,
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
// deno-fmt-ignore
export enum bp {
  nil, lowest, assign, atom, or,
  nor, and, nand, xor, xnor, not, eq,
  rel, sum, prod, quot, pow,
  postfix, call,
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
    return ((this.type === tt.int) || (this.type === tt.float));
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.is(types[i])) return true;
    }
    return false;
  }
}

class AlgebraToken extends Token {
  tokens: Token[];
  constructor(tokens: Token[]) {
    super(tt.algebra, "");
    this.tokens = tokens;
  }
}
const isAlgebraToken = (token: Token): token is AlgebraToken => (
  token.type === tt.algebra
);

const alg = (tokens: Token[]) => (
  new AlgebraToken(tokens)
);

const tk = (type: tt, lex: string) => (
  new Token(type, lex)
);

// § - Node Type Enum
// deno-fmt-ignore
enum nt {
  assign, binex, call, group,
  int, float, rational, string,
  sym, algebra, nil,
}

interface Visitor<T> {
  assign(node: Assign): T;
  binex(node: Binex): T;
  call(node: Call): T;
  group(node: Group): T;
  int(node: Int): T;
  float(node: Float): T;
  nil(node: Nil): T;
  rational(node: Rational): T;
  string(node: Str): T;
  sym(node: Sym): T;
  algebra(node: Algebra): T;
  block(node: Block): T;
  expression(node: Expression): T;
  fn(node: Fn): T;
  predicate(node: Predicate): T;
  returnStmt(node: Return): T;
  vardef(node: VarDef): T;
  loop(node: Loop): T;
}

// § - Node Definitions
abstract class Expr {
  abstract accept<T>(visitor: Visitor<T>): T;
  type: nt;
  constructor(type: nt) {
    this.type = type;
  }
}
// § - Assigment Node.
class Assign extends Expr {
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
  new Assign(name, value)
);

class Algebra extends Expr {
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
  new Algebra(expr)
);

// § - Binary Expression Node.
class Binex extends Expr {
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
  new Binex(left, op, right)
);

// § - Call Node
class Call extends Expr {
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
  new Call(callee, args)
);

// § - Group Node
class Group extends Expr {
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
  new Group(expr)
);

//§ - Nil Node
class Nil extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }
  value: null = null;
  constructor() {
    super(nt.nil);
  }
}
const nil = () => (
  new Nil()
);

// § - Int Node
class Int extends Expr {
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
  new Int(typeof value === "string" ? +value : value)
);

// § - Float Node
class Float extends Expr {
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
  new Float(typeof value === "string" ? +value : value)
);

// § - Rational Node
class Rational extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.rational(this);
  }
  N: Int;
  D: Int;
  constructor(N: Int, D: Int) {
    super(nt.rational);
    this.N = N;
    this.D = D;
  }
}
const rational = (N: Int, D: Int) => (
  new Rational(N, D)
);

// § - String Node
class Str extends Expr {
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
  new Str(value)
);

// § - Symbol Node
class Sym extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.sym(this);
  }
  name: Token;
  constructor(name: Token) {
    super(nt.sym);
    this.name = name;
  }
}

const sym = (t: Token) => (
  new Sym(t)
);

// § Stmt Type
abstract class Stmt {
  abstract accept<T>(visitor: Visitor<T>): T;
}

// § Block Statement
class Block extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.block(this);
  }
  stmts: Stmt[];
  constructor(stmts: Stmt[]) {
    super();
    this.stmts = stmts;
  }
}

const block = (stmts: Stmt[]) => (
  new Block(stmts)
);

//§ - Expression Statement
class Expression extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.expression(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super();
    this.expression = expression;
  }
}

const expression = (expr: Expr) => (
  new Expression(expr)
);

// § - Function Declaration Statement
class Fn extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fn(this);
  }
  name: Token;
  params: Token[];
  body: Stmt[];
  constructor(name: Token, params: Token[], body: Stmt[]) {
    super();
    this.name = name;
    this.params = params;
    this.body = body;
  }
}

const fn = (name: Token, params: Token[], body: Stmt[]) => (
  new Fn(name, params, body)
);

// § - Predicate Statement
class Predicate extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.predicate(this);
  }
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt;
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
    super();
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}

const predicate = (cond: Expr, thenB: Stmt, elseB: Stmt) => (
  new Predicate(cond, thenB, elseB)
);

//§ - Return statement node
class Return extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.returnStmt(this);
  }
  keyword: Token;
  value: Expr;
  constructor(keyword: Token, value: Expr) {
    super();
    this.keyword = keyword;
    this.value = value;
  }
}

const returnStmt = (keyword: Token, value: Expr) => (
  new Return(keyword, value)
);

// § - Variable Definition
class VarDef extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vardef(this);
  }
  name: Token;
  init: Expr;
  constructor(name: Token, init: Expr) {
    super();
    this.name = name;
    this.init = init;
  }
}

const vardef = (name: Token, init: Expr) => (
  new VarDef(name, init)
);

//§ - Loop Statement
class Loop extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loop(this);
  }
  condition: Expr;
  body: Stmt;
  constructor(condition: Expr, body: Stmt) {
    super();
    this.condition = condition;
    this.body = body;
  }
}

const loop = (cond: Expr, body: Stmt) => (
  new Loop(cond, body)
);

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
    while (isDigit(peek(0)) && !atEnd()) tick();
    if (peek(0) === "." && isDigit(peek(1))) {
      tick();
      type = tt.float;
      while (isDigit(peek(0))) tick();
    }
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
  const string = () => {
    while (peek(0) !== `"` && !atEnd()) {
      tick();
    }
    if (atEnd()) return newtkn(tt.error, `Unterminated string.`);
    tick();
    const s = str().slice(1, -1);
    return newtkn(tt.str, s);
  };
  const sym = () => {
    let type = tt.sym;
    while (isLatinGreek(peek(0)) || isDigit(peek(0))) {
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
			case '`': return newtkn(tt.backtick);
			case `'`: return newtkn(tt.quote);
			case '!': return newtkn(match('=') ? tt.neq : tt.bang);
			case '=': return newtkn(match('=') ? tt.deq : tt.eq);
			case '<': return newtkn(match('=') ? tt.leq : tt.lt);
			case '>': return newtkn(match('=') ? tt.geq : tt.gt);
      case `"`: return string();
		}
    return newtkn(tt.error, `unknown token [${c}]`);
  };

  const splittable = (t: Token) => (
    t.is(tt.sym) && !isGreekLetterName(t.lex) && !t.lex.includes("_")
  );
  const symsplit = (tokens: Token[]) => (
    tokens.map((t) =>
      splittable(t) ? t.lex.split("").map((c) => (tk(tt.sym, c))) : t
    ).flat()
  );
  const imul = (tkns: Token[]) => {
    const STAR = tk(tt.star, "*");
    const out: Token[] = [];
    const tokens = zip(tkns, tkns.slice(1));
    let skip = false;
    for (let i = 0; i < tokens.length; i++) {
      const [now, nxt] = tokens[i];
      out.push(now);
      if (skip) {
        skip = true;
        continue;
      }
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
  const tokenize = () => {
    const out: Token[] = [];
    for (let i = 0; i < text.length; i++) {
      const t = scan();
      if (t.is(tt.eof)) break;
      out.push(t);
    }
    out.push(tk(tt.eof, "EOF"));
    const out2: Token[] = [];
    for (let i = 0; i < out.length; i++) {
      const now = out[i];
      if (now.is(tt.backtick)) {
        const sub: Token[] = [];
        let j = i + 1;
        for (; j < out.length; j++) {
          sub.push(out[j]);
          if (out[j].is(tt.backtick)) {
            break;
          }
        }
        const ts: Token[] = [];
        symsplit(sub).forEach((t) => {
          ts.push(t);
        });
        out2.push(alg(imul(ts)));
        i = j;
      } else {
        out2.push(now);
      }
    }
    return out2;
  };
  return imul(tokenize());
};

type ASTNode = Expr | Stmt;
type Parslet = (
  current: Token,
  peek: Token,
  prev: Token,
) => Either<Err, ASTNode>;
type PSpec = Record<tt, [Parslet, Parslet, bp]>;

const isexpr = (node: ASTNode): node is Expr => (
  node instanceof Expr
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
  nextIs(type: tt) {
    if (this.peek.is(type)) {
      this.next();
      return true;
    }
    return false;
  }
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
  err(error: string, source: string) {
    this.error = err(`[${source}]:${error}`);
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

  const __o = bp.nil;
  const __ = (t: Token) => {
    const msg = `Expected expression, got “${t.lex}.”`;
    const e = err(msg);
    return left(e);
  };

  const glyph = (prev: Token) => {
    if (!prev.is(tt.sym)) {
      return state.err(`Expected symbol.`, "glyph");
    }
    return right(sym(prev));
  };

  const atom = (prev: Token) => {
    const type = prev.type;
    const lex = prev.lex;
    // deno-fmt-ignore
    switch (type) {
      case tt.str: return right(str(lex))
      case tt.int: return right(int(lex));
      case tt.float: return right(float(lex));
      default: return state.err(`Expected atom, got ${lex}`, 'atom');
    }
  };

  const scinum = (prev: Token) => {
    if (prev.is(tt.scinum)) {
      const parts = prev.lex.split("E");
      if (parts.length === 2) {
        const [base, exponent] = parts;
        const B = Number.isInteger(+base) ? int(base) : float(base);
        const E = int(exponent);
        return right(binex(B, tk(tt.caret, "^"), E));
      }
    }
    return state.err(`Expected scientific number`, "scinum");
  };

  const infix = (op: Token) => {
    const lastnode = state.lastnode;
    return expr().chain((n) =>
      isexpr(lastnode) && isexpr(n)
        ? right(binex(lastnode, op, n))
        : state.err(`Expected expression`, "infix")
    );
  };

  const primary = () => {
    const result = expr();
    if (result.isLeft()) return result;
    state.next();
    const out = result.chain((n) => {
      if (!isexpr(n)) {
        return state.err(`Expected expression.`, "primary");
      } else return right(group(n));
    });
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
          if (isexpr(n)) args.push(n);
        } while (state.nextIs(tt.comma));
      });
      return state.ifNextIs(
        tt.rparen,
        () => right(call(sym(name), args)),
        () => state.err(`Expected “)”`, "nativeCall"),
      );
    }, () => state.err(`Expected “(”`, "nativeCall"));
    return out;
  };

  const algebraic = (token: Token) => {
    if (isAlgebraToken(token)) {
      const tokens = token.tokens;
      const E = parse(tokens);
      if (E.length === 0) {
        return state.err(`Expected algebraic expression.`, "algebraic");
      }
      const expr = E[0];
      if (expr.isLeft()) return expr;
      const exp = expr.unwrap();
      if (!isexpr(exp)) {
        return state.err(`Expected algebraic expression.`, "algebraic");
      } else {
        return right(algebra(exp));
      }
    } else return state.err(`Unexpected algebra token.`, "algebraic");
  };

  const rules: PSpec = {
    [tt.empty]: [__, __, __o],
    [tt.semicolon]: [__, __, __o],
    [tt.nil]: [__, __, __o],
    [tt.if]: [__, __, __o],
    [tt.else]: [__, __, __o],
    [tt.struct]: [__, __, __o],
    [tt.error]: [__, __, __o],
    [tt.algebra]: [algebraic, __, __o],
    [tt.dquote]: [__, __, __o],
    [tt.quote]: [__, __, __o],
    [tt.lparen]: [primary, __, __o],
    [tt.rparen]: [__, __, __o],
    [tt.lbrace]: [__, __, __o],
    [tt.lbrack]: [__, __, __o],
    [tt.rbrack]: [__, __, __o],
    [tt.rbrace]: [__, __, __o],
    [tt.comma]: [__, __, __o],
    [tt.dot]: [__, __, __o],
    [tt.minus]: [__, infix, bp.sum],
    [tt.plus]: [__, infix, bp.sum],
    [tt.slash]: [__, infix, bp.prod],
    [tt.caret]: [__, infix, bp.pow],
    [tt.star]: [__, infix, bp.prod],
    [tt.rem]: [__, infix, bp.quot],
    [tt.mod]: [__, infix, bp.quot],
    [tt.div]: [__, infix, bp.quot],
    [tt.percent]: [__, infix, bp.quot],
    [tt.bang]: [__, __, __o],
    [tt.eq]: [__, __, __o],
    [tt.deq]: [__, infix, bp.eq],
    [tt.neq]: [__, infix, bp.eq],
    [tt.lt]: [__, infix, bp.eq],
    [tt.gt]: [__, infix, bp.eq],
    [tt.leq]: [__, __, __o],
    [tt.geq]: [__, __, __o],
    [tt.sym]: [glyph, __, bp.atom],
    [tt.str]: [atom, __, bp.atom],
    [tt.int]: [atom, __, bp.atom],
    [tt.float]: [atom, __, bp.atom],
    [tt.scinum]: [scinum, __, bp.atom],
    [tt.call]: [nativeCall, __, bp.call],
    [tt.eof]: [__, __, __o],
    [tt.backtick]: [__, __, __o],
    [tt.let]: [__, __, __o],
    [tt.print]: [__, __, __o],
    [tt.fn]: [__, __, __o],
    [tt.for]: [__, __, __o],
    [tt.while]: [__, __, __o],
    [tt.is]: [__, __, __o],
    [tt.return]: [__, __, __o],
    [tt.true]: [__, __, __o],
    [tt.false]: [__, __, __o],
    [tt.nan]: [__, __, __o],
    [tt.inf]: [__, __, __o],
    [tt.and]: [__, __, __o],
    [tt.nand]: [__, __, __o],
    [tt.not]: [__, __, __o],
    [tt.or]: [__, __, __o],
    [tt.nor]: [__, __, __o],
    [tt.xor]: [__, __, __o],
    [tt.xnor]: [__, __, __o],
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

  const expr = (minbp = bp.lowest) => {
    let prev = state.prev;
    let token = state.next();
    let peek = state.peek;
    const pre = prefixRule(token.type);
    let lhs = pre(token, peek, prev);
    if (lhs.isLeft()) return lhs;
    state.lastParsed(lhs.unwrap());
    while (minbp < precof(state.peek.type)) {
      if (state.atEnd()) break;
      prev = token;
      token = state.next();
      peek = state.peek;
      const r = infixRule(token.type);
      const rhs = r(token, peek, prev);
      if (rhs.isLeft()) return rhs;
      lhs = rhs;
      state.lastParsed(lhs.unwrap());
    }
    return lhs;
  };

  const EXPR = () => {
    const out = expr();
    if (
      state.nextIs(tt.semicolon) ||
      state.peek.is(tt.eof) ||
      state.peek.is(tt.rbrace) ||
      state.prev.is(tt.semicolon) ||
      state.atEnd()
    ) {
      return out;
    }
    return state.err(`Expected expression`, "EXPR");
  };

  const LET = () => {
    const out = state.ifNextIs(
      tt.sym,
      (s) =>
        state.ifNextIs(
          tt.eq,
          () => {
            const out = expr().chain((x) =>
              !isexpr(x)
                ? state.err(`Expected valid rhs`, "LET")
                : right(vardef(s, x))
            );
            return out;
            k;
          },
          (t) => right(vardef(t, nil())),
        ),
      () => state.err(`Expected identifier`, "LET"),
    );
    if (state.peek.is(tt.semicolon)) {
      state.next();
    }
    return out;
  };

  const STMT = () => {
    if (state.nextIs(tt.let)) {
      return LET();
    }
    return EXPR();
  };

  const run = () => {
    let out = [];
    while (!state.atEnd()) {
      const n = STMT();
      out.push(n);
    }
    return out;
  };
  return run();
};

const tokenlist = (tokens: Token[]) => (
  tokens.map((t) => `${tt[t.type]}( ${t.lex} )`)
);

const k = parse("`2x + 1`");
console.log(k);
