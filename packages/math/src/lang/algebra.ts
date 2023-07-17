import {
  dne,
  Either,
  floor,
  isDigit,
  isGreekLetterName,
  isLatinGreek,
  Left,
  left,
  mod,
  print,
  Right,
  right,
  stringUnion,
  strTree,
  zip,
} from "./util.js";

type BasicNumber = "float" | "int";
type CompositeNumber = "frac" | "sci";
type Numeric = BasicNumber | CompositeNumber;
type StmtKind = "fn" | "let" | "expr" | "if" | "loop" | "block";
type NonNumeric = "bool" | "sym" | "string" | "nil";
type NativeFn =
  | "sin"
  | "cos"
  | "tan"
  | "sum"
  | "mul"
  | "pow";
type Operator =
  | RelationalOperator
  | ArithmeticOperator
  | UnaryOperator
  | NativeFn
  | `call-${string}`;
type ExprKind =
  | RelationalOperator
  | ArithmeticOperator
  | UnaryOperator
  | BasicNumber
  | NonNumeric
  | CompositeNumber
  | NativeFn
  | ":="
  | `call`;
type NodeKind = StmtKind | ExprKind;
type RelationalOperator = ">" | "<" | "!=" | "<=" | ">=" | "==";
type Keyword =
  | "let"
  | "fn"
  | "while"
  | "for"
  | "if"
  | "else"
  | "return";
type UnaryOperator = "-" | "+" | "!";
type Delimiter =
  | "("
  | ")"
  | "{"
  | "}"
  | "["
  | "]"
  | ","
  | ":"
  | ";"
  | "begin"
  | "end";
type AssignOperator = "=";
type Utility = "EMPTY" | "EOF" | "ERR";
type ArithmeticOperator =
  | "-"
  | "+"
  | "/"
  | "*"
  | "^"
  | "%"
  | "div"
  | "rem"
  | "mod";
// deno-fmt-ignore
type tt =
  | "."
	| Delimiter
	| Numeric
	| ArithmeticOperator
	| UnaryOperator
	| RelationalOperator
  | AssignOperator
  | Keyword
	| '!'
	| NonNumeric
	| 'CALL'
	| Utility

type ErrType = "lexical" | "syntax" | "binding" | "type";
/**
 * Error messages are kept in `Err`
 * objects.
 */
class Err {
  message: string;
  type: ErrType;
  constructor(message: string, type: ErrType) {
    this.message = message;
    this.type = type;
  }
}
/**
 * Returns a new lexical error.
 */
const lexicalError = (message: string) => (
  new Err(message, "lexical")
);

class Token<T extends tt = tt> {
  /**
   * The token’s given type.
   * This is a broader classification
   * of the token than the the lexeme.
   */
  type: T;

  /** The token’s specific lexeme. */
  lex: string;

  /** The line where this token was encountered. */
  line: number;

  constructor(type: T, lex: string, line: number) {
    this.type = type;
    this.lex = lex;
    this.line = line;
  }
  /**
   * Returns a copy of this token.
   * Optional type, lexeme, and line properties
   * may be provided in place of the copy’s
   * duplicated properties.
   */
  copy(type?: tt, lex?: string, line?: number) {
    return new Token(
      !dne(type) ? type : this.type,
      !dne(lex) ? lex : this.lex,
      !dne(line) ? line : this.line,
    );
  }

  /**
   * Returns true if this token is a numeric
   * token. Numeric tokens are all tokens of type:
   *
   * - `RATIO` - a rational number (e.g., `1/2`)
   * - `INT` - an integer (e.g., `67`).
   * - `FLOAT` - a floating point number (e.g., `3.14`).
   * - `SCI` - a scientific number (e.g., `9.81E+43`).
   */
  isnum() {
    return (
      this.type === "frac" ||
      this.type === "int" ||
      this.type === "float" ||
      this.type === "sci"
    );
  }

  /**
   * Returns true if this operator
   * is a {@link UnaryOperator} token.
   */
  unary(): this is Token<UnaryOperator> {
    return (
      this.type === "-" ||
      this.type === "+" ||
      this.type === "!"
    );
  }

  /**
   * Returns true if this
   * token is a {@link RelationalOperator}
   * token.
   */
  relational(): this is Token<RelationalOperator> {
    return (
      this.type === ">" ||
      this.type === "<" ||
      this.type === "==" ||
      this.type === "!=" ||
      this.type === "<=" ||
      this.type === ">="
    );
  }

  /**
   * Returns true if this token
   * matches the provided type.
   */
  is(type: T) {
    return this.type === type;
  }

  /**
   * Returns true if this token is an
   * {@link ArithmeticOperator} token.
   */
  arithmetic(): this is Token<ArithmeticOperator> {
    return (
      this.type === "-" ||
      this.type === "+" ||
      this.type === "/" ||
      this.type === "*" ||
      this.type === "^" ||
      this.type === "%" ||
      this.type === "div" ||
      this.type === "rem" ||
      this.type === "mod"
    );
  }

  /**
   * The token representation of the empty token,
   * used primarily as a placeholder and base
   * case.
   */
  static empty = new Token("EMPTY", "", -1);
}

/**
 * Returns a new token.
 */
const tkn = (type: tt, lex: string, line: number) => (
  new Token(type, lex, line)
);

type StringSet = Set<string>;
const lex = (input: string, functions: StringSet = new Set()) => {
  /**
   * Tracks the line number.
   */
  let line = 0;

  /**
   * Points to the first character
   * of the lexeme currently being
   * scanned.
   */
  let start = 0;

  /**
   * Points at the character currently
   * being read.
   */
  let current = 0;

  /**
   * Mutable variable - Initialized
   * if an error occurred during scanning.
   */
  let error: null | Err = null;

  /**
   * Returns true if the scanner has reached
   * the end of input.
   */
  const atEnd = () => (current >= input.length) || (error !== null);

  /**
   * Consumes and returns the next character
   * in the input expression.
   */
  const tick = () => input[current++];

  /**
   * Returns the input substring from
   * start to current.
   */
  const slice = () => input.slice(start, current);

  /**
   * Returns a new token.
   */
  const token = (type: tt, lexeme?: string) => {
    const lex = lexeme ? lexeme : slice();
    return tkn(type, lex, line);
  };

  /**
   * Returns an error token. If called,
   * sets the mutable error variable.
   */
  const errorToken = (message: string) => {
    const out = tkn("ERR", message, line);
    error = lexicalError(message);
    return out;
  };

  /**
   * Returns the current character.
   */
  const peek = () => atEnd() ? "" : input[current];

  /**
   * Returns the character just
   * head of the current character.
   */
  const peekNext = () => atEnd() ? "" : input[current + 1];

  /**
   * Returns the character
   * n places ahead of current.
   */
  const nextChar = (n: number) => atEnd() ? "" : input[current + n];

  /**
   * Scans a string.
   */
  const string = () => {
    while (peek() !== `"` && !atEnd()) {
      if (peek() === `\n`) line++;
      tick();
    }
    if (atEnd()) return errorToken(`Infinite string`);
    tick();
    return token("string");
  };

  /**
   * If the provided expected string
   * matches, increments the current
   * pointer and returns true.
   * Otherwise returns false without
   * increment.
   */
  const match = (expected: string) => {
    if (atEnd()) return false;
    if (input[current] !== expected) return false;
    current++;
    return true;
  };

  /**
   * Returns true if the current peek (the character
   * pointed at by `current`) matches the provided
   * number.
   */
  const peekIs = (c: string) => (peek() === c);

  /**
   * Scans a number.
   */
  const number = (init: Numeric) => {
    let type: Numeric = init;

    // integer
    while (isDigit(peek()) && !atEnd()) {
      tick();
    }

    if (peekIs("_") && isDigit(peekNext())) {
      tick(); // eat the '_'

      /**
       * Keep track of how many digits we’ve
       * hit to ensure separators are correct.
       *
       * @example
       * ~~~ts
       * 1_242_125 // ok
       * 12_000_123 // ok
       * 124_111_125 // ok
       * 482_3_428 // not ok
       * 4253_388_48 // not ok
       * ~~~
       */
      let digits = 0;
      while (isDigit(peek()) && !atEnd()) {
        tick();
        digits++;
        if (peekIs("_") && isDigit(peekNext())) {
          if (digits === 3) {
            tick(); // eat the '_'
            digits = 0; // reset the counter
          } else {
            return errorToken(`Expected 3 digits before separator.`);
          }
        }
      }
      if (digits !== 3) {
        return errorToken(`Expected 3 digits after separator.`);
      }
    }

    /**
     * Rational numbers take the form:
     * ~~~ts
     * [int] '|' [int]
     * ~~~
     * Both sides must be integers.
     */
    if (match("|")) {
      if (type === "int") {
        type = "frac";
        while (isDigit(peek()) && !atEnd()) {
          tick();
        }
      } else { // The `~` should always be followed by an integer
        return errorToken(`Expected integer after “|”`);
      }
    }

    // floats
    if (peekIs(".") && isDigit(peekNext())) {
      tick();
      type = "float";
      while (isDigit(peek())) tick();
    }

    // scientific
    /**
     * Syntax is: [float] 'E' ('+'|'-') [int]
     * The exponent must always be an integer.
     */
    if (peekIs("E")) {
      if (isDigit(peekNext())) {
        // This is a scientific with the form [float] E [int]
        type = "sci";
        tick(); // eat the 'E'
        while (isDigit(peek())) tick();
      } else if (
        ((peekNext() === "+") || (peekNext() === "-")) && isDigit(nextChar(2))
      ) {
        // This is a scientific with the form [float] E (+|-) [int]
        type = "sci";
        tick(); // eat the 'E'
        tick(); // eat the '+' or '-'
        while (isDigit(peek())) tick();
      }
    }
    return token(type);
  };

  /**
   * Scans a word. Word is defined as
   * either a user-defined symbol (the token `SYM`)
   * or a reserved word.
   */
  const word = () => {
    while ((isLatinGreek(peek()) || isDigit(peek())) && !atEnd()) {
      tick();
    }
    const s = slice();
    // deno-fmt-ignore
    switch (s) {
      case 'fn': return token('fn');
      case 'let': return token('let');
      case 'begin': return token('begin');
      case 'end': return token('end');
      case 'if': return token('if');
      case 'else': return token('else');
			case 'div': return token('div');
			case 'rem': return token('rem');
			case 'mod': return token('mod');
			case 'nan': return token('int');
			case 'inf': return token('int');
			case 'nil': return token('nil');
			case 'false':
			case 'true': return token('bool');
		}
    if (functions.has(s)) {
      return token("CALL");
    }
    return token("sym");
  };

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
				case '\t': tick(); break;
				case '\n': line++; tick(); break;
				default: return;
			}
    }
  };

  /** Scans a token. */
  const scan = () => {
    skipws();
    start = current;
    if (atEnd()) return token("EOF");
    const c = tick();
    if (isLatinGreek(c)) return word();
    if (isDigit(c)) return number("int");
    if (c === "." && isDigit(peek())) return number("float");
    // deno-fmt-ignore
    switch (c) {
      case ':': return token(':');
      case "(": return token("(");
      case ")": return token(")");
      case "[": return token("[");
      case "]": return token("]");
      case "{": return token("{");
      case "}": return token("}");
      case ",": return token(",");
      case ".": return token(".");
      case "-": return token("-");
      case "+": return token("+");
      case "*": return token("*");
      case "%": return token("%");
      case ';': return token(';');
			case '/': return token('/');
			case '^': return token('^');
			case '!': return token(match('=') ? '!=' : '!');
			case '=': return token(match('=') ? '==' : '=');
			case '<': return token(match('=') ? '<=' : '<');
			case '>': return token(match('=') ? '>=' : '>');
			case `"`: return string();
    }
    return errorToken(`Unknown token ${c}.`);
  };

  /** Cross-reference the final return. */
  const tokenize = () => {
    const out: Token[] = [];
    while (!atEnd()) {
      out.push(scan());
      if (error !== null) return left(error);
    }
    return right(out);
  };

  return {
    /**
     * Runs a scan exactly once (returning
     * one token) on the provided string.
     */
    scan,

    /**
     * Returns an array of all the tokens
     * of the provided string.
     */
    tokenize,
  };
};

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
const symsplit = (tokens: Token[]) => (
  tokens.map((t) =>
    t.is("sym") && !isGreekLetterName(t.lex) && !t.lex.includes("_") &&
      !t.lex.startsWith("$")
      ? t.lex.split("").map((c) => tkn("sym", c, t.line))
      : t
  ).flat()
);

/**
 * Given an array of tokens, returns a
 * new array of tokens with explicit
 * asterisk tokens (`*`) for implicit
 * multiplication.
 */
const imul = (tkns: Token[]) => {
  const out: Token[] = [];
  const tokens = zip(tkns, tkns.slice(1));
  for (let i = 0; i < tokens.length; i++) {
    const [now, nxt] = tokens[i];
    out.push(now);
    if (now.is(")")) {
      if (nxt.is("sym")) {
        out.push(nxt.copy("*", "*"));
      } else if (nxt.is("(")) {
        out.push(nxt.copy("*", "*"));
      }
    } else if (now.isnum() && nxt.is("CALL")) {
      out.push(nxt.copy("*", "*"));
    } else if (now.isnum() && nxt.is("sym")) {
      out.push(nxt.copy("*", "*"));
    } else if (now.isnum() && nxt.is("(")) {
      out.push(nxt.copy("*", "*"));
    } else if (now.is("sym") && nxt.is("sym")) {
      out.push(nxt.copy("*", "*"));
    }
  }
  out.push(tkns[tkns.length - 1]);
  return out;
};

/**
 * Returns a new parser error.
 */
const parserError = (message: string) => (
  new Err(message, "syntax")
);

interface Visitor<T> {
  num(node: Num): T;
  ratio(node: Ratio): T;
  symbol(node: Sym): T;
  nil(node: Nil): T;
  string(node: Str): T;
  bool(node: Bool): T;
  binary(node: Binary): T;
  unary(node: Unary): T;
  call(node: Call): T;
  nativeCall(node: NativeCall): T;
  relation(node: Relation): T;
  block(node: Block): T;
  group(node: Group): T;
  assignment(node: Assignment): T;
  fnStmt(node: FnStmt): T;
  varStmt(node: VarStmt): T;
  ifStmt(node: IfStmt): T;
  exprStmt(node: ExprStmt): T;
}

interface ExprVisitor<T> {
  nil(node: Nil): T;
  bool(node: Bool): T;
  string(node: Str): T;
  symbol(node: Sym): T;
  num(node: Num): T;
  group(node: Group): T;
  relation(node: Relation): T;
  binary(node: Binary): T;
  ratio(node: Ratio): T;
  unary(node: Unary): T;
  call(node: Call): T;
  nativeCall(node: NativeCall): T;
  assignment(node: Assignment): T;
}

class Program {
  statements: Stmt[];
  error: Err | null;
  constructor(statements: Stmt[], error: Err | null) {
    this.statements = statements;
    this.error = error;
  }
}
const success = (statements: Stmt[]) => (
  new Program(statements, null)
);
const failure = (error: Err) => (
  new Program([], error)
);

abstract class ASTNode {
  kind: NodeKind;
  abstract accept<T>(visitor: Visitor<T>): T;
  constructor(kind: NodeKind) {
    this.kind = kind;
  }
  abstract toString(): string;
}

abstract class Expr extends ASTNode {
  kind: ExprKind;
  abstract acceptExprOp<T>(visitor: ExprVisitor<T>): T;
  constructor(kind: ExprKind) {
    super(kind);
    this.kind = kind;
  }
  abstract number_of_operands(): number;
}

interface AlgebraOp<T> {
  nil(node: Nil): T;
  symbol(node: Sym): T;
  num(node: Num): T;
  group(node: Group): T;
  binary(node: Binary): T;
  ratio(node: Ratio): T;
  unary(node: Unary): T;
  call(node: Call): T;
  nativeCall(node: NativeCall): T;
}

abstract class AlgebraicExpr extends Expr {
  abstract acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T;
}

/**
 * Returns true if the given node is an algebraic
 * expression.
 */
const isAlgebraicExpr = (node: ASTNode): node is AlgebraicExpr => (
  node instanceof AlgebraicExpr
);

class Nil extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.nil(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nil(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.nil(this);
  }
  value: null = null;
  constructor() {
    super("nil");
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return "nil";
  }
}
const nil = () => (new Nil());

class Bool extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.bool(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.bool(this);
  }
  bool: boolean;
  constructor(value: boolean) {
    super("bool");
    this.bool = value;
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return `${this.bool}`;
  }
}
const bool = (value: boolean) => (
  new Bool(value)
);

class Str extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.string(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.string(this);
  }
  str: string;
  constructor(str: string) {
    super("string");
    this.str = str;
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return this.str;
  }
}
const str = (value: string) => (
  new Str(value)
);

class Sym extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.symbol(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.symbol(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.symbol(this);
  }
  s: string;
  constructor(sym: string) {
    super("sym");
    this.s = sym;
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return this.s;
  }
}

const sym = (s: string) => (
  new Sym(s)
);
const isSymbol = (node: ASTNode): node is Sym => (
  node.kind === "sym"
);

/**
 * A number node hold either
 * an integer or a float, as set
 * by its type field.
 */
class Num extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.num(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.num(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.num(this);
  }
  n: number;
  type: BasicNumber;
  constructor(n: number, type: BasicNumber) {
    super(type);
    this.n = n;
    this.type = type;
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return `${this.n}`;
  }
}

/**
 * Returns a new Num node
 * of type `INT`
 */
const int = (n: string | number) => (
  new Num(typeof n === "string" ? floor(+n) : floor(n), "int")
);

/**
 * Returns a new Num node
 * of type `FLOAT`.
 */
const float = (n: string) => (
  new Num(+n, "float")
);

class Group extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.group(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.group(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.group(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(expression.kind);
    this.expression = expression;
  }
  number_of_operands(): number {
    return this.expression.number_of_operands();
  }
  toString(): string {
    return `(${this.expression.toString()})`;
  }
}
const group = (expression: Expr) => (
  new Group(expression)
);

class Relation extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relation(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.relation(this);
  }
  left: Expr;
  op: RelationalOperator;
  right: Expr;
  constructor(lhs: Expr, op: RelationalOperator, rhs: Expr) {
    super(op);
    this.left = lhs;
    this.op = op;
    this.right = rhs;
  }
  number_of_operands(): number {
    return 2;
  }
  toString(): string {
    return `${this.left.toString()} ${this.op} ${this.right.toString()}`;
  }
}

const relation = (lhs: Expr, op: RelationalOperator, rhs: Expr) => (
  new Relation(lhs, op, rhs)
);

class Binary extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.binary(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binary(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.binary(this);
  }
  left: Expr;
  op: ArithmeticOperator;
  right: Expr;
  constructor(left: Expr, op: ArithmeticOperator, right: Expr) {
    super(op);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  number_of_operands(): number {
    return 2;
  }
  toString(): string {
    return `${this.left.toString} ${this.op} ${this.right.toString}`;
  }
}
const binary = (left: Expr, op: ArithmeticOperator, right: Expr) => (
  new Binary(left, op, right)
);

class Ratio extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.ratio(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ratio(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.ratio(this);
  }
  n: number;
  d: number;
  constructor(n: number, d: number) {
    super("frac");
    this.n = n;
    this.d = d;
  }
  number_of_operands(): number {
    return 0;
  }
  toString(): string {
    return `${this.n}/${this.d}`;
  }
}
const ratio = (n: number, d: number) => (
  new Ratio(n, d)
);

class Unary extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.unary(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.unary(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.unary(this);
  }
  op: UnaryOperator;
  arg: Expr;
  fix: 0 | 1;
  constructor(op: UnaryOperator, arg: Expr, fix: 0 | 1) {
    super(op);
    this.op = op;
    this.arg = arg;
    this.fix = fix;
  }
  number_of_operands(): number {
    return 1;
  }
  toString(): string {
    return this.fix === 0
      ? `${this.op}(${this.arg.toString()})`
      : `${this.arg.toString()}${this.op}`;
  }
}

const unaryPrefix = (op: UnaryOperator, arg: Expr) => (
  new Unary(op, arg, 0)
);
const unaryPostfix = (op: UnaryOperator, arg: Expr) => (
  new Unary(op, arg, 1)
);

class Call extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.call(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.call(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.call(this);
  }
  f: Expr;
  args: Expr[];
  constructor(f: Expr, args: Expr[]) {
    super(`call`);
    this.f = f;
    this.args = args;
  }
  number_of_operands(): number {
    return this.args.length;
  }
  toString(): string {
    return `${this.f.toString()}(${
      this.args.map((v) => v.toString()).join(",")
    })`;
  }
}

const call = (f: Expr, args: Expr[]) => (
  new Call(f, args)
);

class NativeCall extends AlgebraicExpr {
  acceptAlgebraOp<T>(visitor: AlgebraOp<T>): T {
    return visitor.nativeCall(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nativeCall(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.nativeCall(this);
  }
  name: NativeFn;
  args: Expr[];
  constructor(name: NativeFn, args: Expr[]) {
    super(name);
    this.name = name;
    this.args = args;
  }
  number_of_operands(): number {
    return this.args.length;
  }
  toString(): string {
    return `${this.name}(${this.args.map((v) => v.toString()).join(",")})`;
  }
}
const nativeCall = (name: NativeFn, args: Expr[]) => (
  new NativeCall(name, args)
);

class Assignment extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assignment(this);
  }
  acceptExprOp<T>(visitor: ExprVisitor<T>): T {
    return visitor.assignment(this);
  }
  number_of_operands(): number {
    return 1;
  }
  name: string;
  expr: Expr;
  constructor(name: string, expr: Expr) {
    super(":=");
    this.name = name;
    this.expr = expr;
  }
  toString(): string {
    return `${this.name} := ${this.expr.toString()}`;
  }
}
const assignment = (name: string, expr: Expr) => (
  new Assignment(name, expr)
);

abstract class Stmt extends ASTNode {
  kind: StmtKind;
  constructor(kind: StmtKind) {
    super(kind);
    this.kind = kind;
  }
  toString(): string {
    return this.kind;
  }
}

class Block extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.block(this);
  }
  stmts: Stmt[];
  constructor(stmts: Stmt[]) {
    super("block");
    this.stmts = stmts;
  }
}
const block = (stmts: Stmt[]) => (
  new Block(stmts)
);

class ExprStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.exprStmt(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super("expr");
    this.expression = expression;
  }
}
const exprStmt = (expression: Expr) => (
  new ExprStmt(expression)
);
class VarStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.varStmt(this);
  }
  name: string;
  init: Expr;
  constructor(name: string, init: Expr) {
    super("let");
    this.name = name;
    this.init = init;
  }
  number_of_operands(): number {
    return this.init.number_of_operands();
  }
}
const varStmt = (name: string, init: Expr) => (
  new VarStmt(name, init)
);

class FnStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fnStmt(this);
  }
  name: string;
  args: string[];
  body: Stmt;
  constructor(name: string, args: string[], body: Stmt) {
    super("fn");
    this.name = name;
    this.args = args;
    this.body = body;
  }
  number_of_operands(): number {
    return this.args.length;
  }
}
const fnStmt = (name: string, args: string[], body: Stmt) => (
  new FnStmt(name, args, body)
);

class IfStmt extends Stmt {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ifStmt(this);
  }
  condition: Expr;
  thenBranch: Stmt;
  elseBranch: Stmt;
  constructor(condition: Expr, thenBranch: Stmt, elseBranch: Stmt) {
    super("if");
    this.condition = condition;
    this.thenBranch = thenBranch;
    this.elseBranch = elseBranch;
  }
}
const ifStmt = (condition: Expr, thenBranch: Stmt, elseBranch: Stmt) => (
  new IfStmt(condition, thenBranch, elseBranch)
);

/**
 * An object encapsulation of
 * all global state data during
 * parsing.
 */
class ParserState {
  static of(source: string) {
    return new ParserState(source);
  }
  error: null | Err = null;
  source: string;
  cursor: number = -1;
  /** The maximum cursor index. */
  max: number = 0;
  tokens: Token[];
  peek: Token = Token.empty;
  current: Token = Token.empty;
  nativeFns = new Set<NativeFn>([
    "cos",
    "sin",
    "tan",
    "sum",
    "mul",
    "pow",
  ]);
  isNative(t: string): t is NativeFn {
    return this.nativeFns.has(t as any);
  }
  constructor(source: string) {
    this.source = source;
    const tkns = lex(source, this.nativeFns).tokenize();
    if (tkns.isLeft()) {
      this.tokens = [];
      this.error = tkns.unwrap();
    } else {
      this.tokens = imul(symsplit(tkns.unwrap()));
      this.max = this.tokens.length - 1;
    }
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
   * Returns the token at the `currentIndex + index`
   * _without_ changing the index.
   */
  lookahead(index: number) {
    const out = this.tokens[this.cursor + index];
    if (out) return out;
    return tkn("EOF", "", this.max);
  }
  /**
   * Returns true if the next token
   * is the provided type _without_
   * consuming the token.
   */
  check(type: tt) {
    if (this.atEnd()) return false;
    return this.peek.is(type);
  }
  /**
   * Returns true if the state has reached
   * the end of input.
   */
  atEnd() {
    return this.cursor === (this.tokens.length - 1);
  }
  next() {
    this.cursor++;
    this.current = this.peek;
    const nextToken = this.tokens[this.cursor]
      ? this.tokens[this.cursor]
      : tkn("EOF", "eof", 1);
    this.peek = nextToken;
    return this.current;
  }
  lastNode: ASTNode = nil();
  /**
   * If called, sets the state’s error
   * status to the provided error message,
   * and returns a {@link Left}. If
   * the state’s error field is initialized
   * (by default `null`), then the parser
   * will halt immediately and return the
   * error message.
   */
  err(message: string, source: string) {
    const msg = `[${source}]: ${message}`;
    const e = parserError(msg);
    this.error = e;
    return left(e);
  }
  /**
   * If called, sets the state’s last
   * parsed node to the provided node T,
   * and returns `Right<T>` (See {@link Right}).
   * All nodes should ultimately return their
   * results through this method so
   * as to allow other nodes to keep
   * track of what was last parsed.
   */
  ok<T extends ASTNode>(node: T) {
    this.lastNode = node;
    return right(node);
  }
  /**
   * Returns true if an implicit
   * semicolon is encountered. An implicit
   * semicolons exists if:
   *
   * 1. The upcoming token is the end of input (`eof` token), or
   * 2. The upcoming token is a right brace (`end` token), or
   * 3. The token stream has reached an unexpected end of input.
   */
  implicitSemicolonOk() {
    return (
      this.peek.is("EOF") ||
      this.peek.is("end") ||
      this.atEnd()
    );
  }
}

type Parslet = (
  current: Token,
  lastnode: Expr,
) => Either<Err, Expr>;
type PEntry = [Parslet, Parslet, number];
type PSpec = Record<tt, PEntry>;

const parse = (input: string) => {
  const expected = (exp: string, actual: string) => (
    `Expected ${exp}, got “${actual}”`
  );
  const state = ParserState.of(input);
  const __: Parslet = (t) => {
    if (state.error) return left(state.error);
    return state.err(expected("expression", t.lex), "expr");
  };

  /**
   * Parses a scientific number.
   */
  const scientific: Parslet = (prev) => {
    const lex = prev.lex;
    if (!prev.is("sci")) {
      return state.err(expected("scientific number", lex), "SCI");
    }
    const [n, d] = lex.split("E");
    const base = Number.isInteger(+n) ? int(n) : float(n);
    const exp = binary(int("10"), "^", int(d));
    return state.ok(binary(base, "*", exp));
  };

  const prefix: Parslet = (op) => {
    if (!op.unary()) {
      return state.err(`Expected unary operator`, "unary-prefix");
    }
    const p = precof(op.type);
    return expr(p).chain((n) => state.ok(unaryPrefix(op.type, n)));
  };

  const postfix: Parslet = (op, node) => {
    if (!op.unary()) {
      return state.err(`Expected unary postfix`, "unary-postfix");
    }
    return state.ok(unaryPostfix(op.type, node));
  };

  /**
   * Parses a rational number.
   */
  const rational: Parslet = (prev) => {
    const lex = prev.lex;
    if (!prev.is("frac")) {
      return state.err(expected("RATIO", lex), "rational");
    }
    const [n, d] = lex.split("|");
    return state.ok(ratio(+n, +d));
  };

  /**
   * Parses an atom.
   */
  const atom: Parslet = (prev) => {
    const type = prev.type;
    const lex = prev.lex;
    // deno-fmt-ignore
    switch (type) {
      case "int": return state.ok(int(lex));
			case 'float': return state.ok(float(lex));
			case 'sym': return state.ok(sym(lex));
			case 'bool': return state.ok(bool(lex==='true'))
      case "string": return state.ok(str(lex));
			case 'nil': return state.ok(nil());
      default: return state.err(expected("atom", lex), "atom");
    }
  };

  /**
   * Parses a binary expression.
   */
  const infix: Parslet = (op, node) => {
    if (!op.arithmetic()) {
      return state.err(`Expected arithmetic operator.`, "infix");
    }
    const p = precof(op.type);
    return expr(p).chain((n) => {
      return state.ok(binary(node, op.type, n));
    });
  };

  const assign: Parslet = (_, node) => {
    if (!isSymbol(node)) {
      return state.err(`Invalid assignment target`, "assign");
    }
    return expr().chain((n) => state.ok(assignment(node.s, n)));
  };

  /**
   * Parses a relational expression.
   */
  const compare: Parslet = (op, node) => {
    if (!op.relational()) {
      return state.err(`Expected relational operator`, `compare`);
    }
    const p = precof(op.type);
    return expr(p).chain((n) => {
      return state.ok(relation(node, op.type, n));
    });
  };
  const primary = () => {
    const innerExpr = expr();
    if (innerExpr.isLeft()) return innerExpr;
    state.next();
    const out = innerExpr.chain((n) => state.ok(group(n)));
    return out;
  };
  const comlist = () => {
    const elements: Expr[] = [];
    do {
      const e = expr();
      if (e.isLeft()) return e;
      elements.push(e.unwrap());
    } while (state.nextIs(","));
    return right(elements);
  };
  const native: Parslet = (op) => {
    const lex = op.lex;
    if (!state.isNative(lex)) {
      return state.err(`Unexpected native call`, "native");
    }
    if (!state.nextIs("(")) {
      return state.err(`Expected “(” to open arguments`, "native");
    }
    let args: Expr[] = [];
    if (!state.check(")")) {
      const arglist = comlist();
      if (arglist.isLeft()) return arglist;
      args = arglist.unwrap();
    }
    if (!state.nextIs(")")) {
      return state.err(expected(")", state.peek.lex), "native");
    }
    return state.ok(nativeCall(lex, args));
  };

  const callExpr: Parslet = (_, lastnode) => {
    const callee = lastnode;
    let args: Expr[] = [];
    if (!state.check(")")) {
      const arglist = comlist();
      if (arglist.isLeft()) return arglist;
      args = arglist.unwrap();
    }
    if (!state.nextIs(")")) {
      return state.err(`Expected “)” to close arguments`, "call");
    }
    return state.ok(call(callee, args));
  };

  const __o = -1;
  const LOWEST = 0;
  const ASSIGN = 10;
  const ATOM = 20;
  const LIST = 30;
  const LOGIC = 35;
  const RELATION = 40;
  const SUM = 50;
  const PRODUCT = 60;
  const QUOTIENT = 70;
  const POWER = 80;
  const CALL = 90;
  const rules: PSpec = {
    "(": [primary, callExpr, CALL],
    ")": [__, __, __o],
    ":": [__, __, __o],
    ";": [__, __, __o],
    "{": [__, __, __o],
    "}": [__, __, __o],
    "[": [__, __, __o],
    "]": [__, __, __o],
    ",": [__, __, __o],
    ".": [__, __, __o],
    "=": [__, assign, ASSIGN],
    CALL: [native, __, CALL],
    "+": [prefix, infix, SUM],
    "-": [prefix, infix, SUM],
    "*": [__, infix, PRODUCT],
    "^": [__, infix, POWER],
    "/": [__, infix, PRODUCT],
    "%": [__, infix, QUOTIENT],
    rem: [__, infix, QUOTIENT],
    div: [__, infix, QUOTIENT],
    mod: [__, infix, QUOTIENT],
    "<": [__, compare, RELATION],
    ">": [__, compare, RELATION],
    "!=": [__, compare, RELATION],
    "==": [__, compare, RELATION],
    "<=": [__, compare, RELATION],
    ">=": [__, compare, RELATION],
    "!": [__, postfix, CALL],
    begin: [__, __, __o],
    end: [__, __, __o],
    int: [atom, __, ATOM],
    float: [atom, __, ATOM],
    bool: [atom, __, ATOM],
    sym: [atom, __, ATOM],
    string: [atom, __, ATOM],
    nil: [atom, __, ATOM],
    frac: [rational, __, ATOM],
    sci: [scientific, __, ATOM],
    EMPTY: [__, __, __o],
    ERR: [__, __, __o],
    EOF: [__, __, __o],
    fn: [__, __, __o],
    let: [__, __, __o],
    while: [__, __, __o],
    for: [__, __, __o],
    if: [__, __, __o],
    else: [__, __, __o],
    return: [__, __, __o],
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
  const expr = (minbp: number = LOWEST) => {
    let token = state.next();
    const pre = prefixRule(token.type);
    let lhs = pre(token, nil());
    if (lhs.isLeft()) return lhs;
    while (minbp < precof(state.peek.type)) {
      if (state.atEnd()) break;
      token = state.next();
      const r = infixRule(token.type);
      const rhs = r(token, lhs.unwrap());
      if (rhs.isLeft()) return rhs;
      lhs = rhs;
    }
    return lhs;
  };

  const BLOCK = () => {
    const stmts: Stmt[] = [];
    while (!state.check("end") && !state.atEnd()) {
      const stmt = STMT();
      if (stmt.isLeft()) return stmt;
      stmts.push(stmt.unwrap());
    }
    if (!state.nextIs("end")) {
      return state.err(`expected closing “end”`, "block");
    }
    return state.ok(block(stmts));
  };

  const FN = () => {
    const name = state.next();
    if (!name.is("sym")) {
      return state.err(`Expected function name`, "fn");
    }
    if (!state.nextIs("(")) {
      return state.err(`Expected “(” to open params`, "fn");
    }
    let params: string[] = [];
    if (!state.peek.is(")")) {
      const elems = comlist();
      if (elems.isLeft()) return elems;
      const ps = elems.unwrap();
      for (let i = 0; i < ps.length; i++) {
        const e = ps[i];
        if (!isSymbol(e)) {
          return state.err(`Expected parameter symbol`, "fn");
        }
        params.push(e.s);
      }
    }
    if (!state.nextIs(")")) {
      return state.err(`Expected “)” to close params`, "fn");
    }
    if (!state.nextIs("=")) {
      return state.err(`Expected assign “=” after params`, "fn");
    }
    const body = STMT();
    if (body.isLeft()) return body;
    return state.ok(fnStmt(name.lex, params, body.unwrap()));
  };

  /**
   * Parses a variable definition
   * @example
   * let y = 2;
   */
  const LET = () => {
    // let eaten in statement
    const name = state.next();
    if (!name.is("sym")) {
      return state.err(`Expected symbol`, "let");
    }
    if (!state.nextIs("=")) {
      return state.err(`Expected assign “=”`, "let");
    }
    const init = EXPR();
    if (init.isLeft()) return init;
    const value = init.unwrap().expression;
    return state.ok(varStmt(name.lex, value));
  };
  const EXPR = () => {
    const out = expr();
    if (out.isLeft()) return out;
    if (state.nextIs(";") || state.implicitSemicolonOk()) {
      return state.ok(exprStmt(out.unwrap()));
    }
    return state.err(`Expected “;” to end statement`, "expression");
  };

  const IF = () => {
    // if eaten by STMT
    const condition = expr();
    if (condition.isLeft()) return condition;
    if (!state.nextIs("begin")) {
      return state.err(`Expected “begin” after condition`, "if");
    }
    const ifBranch = BLOCK();
    if (ifBranch.isLeft()) return ifBranch;
    let elseBranch: Stmt = exprStmt(nil());
    if (state.nextIs("else")) {
      const _else = STMT();
      if (_else.isLeft()) return _else;
      elseBranch = _else.unwrap();
    }
    return state.ok(ifStmt(condition.unwrap(), ifBranch.unwrap(), elseBranch));
  };

  const STMT = (): Left<Err> | Right<Stmt> => {
    if (state.nextIs("begin")) return BLOCK();
    if (state.nextIs("let")) return LET();
    if (state.nextIs("fn")) return FN();
    if (state.nextIs("if")) return IF();
    return EXPR();
  };
  const program = () => {
    const stmts: Stmt[] = [];
    while (!state.atEnd()) {
      const stmt = STMT();
      if (stmt.isLeft()) {
        return failure(stmt.unwrap());
      } else {
        stmts.push(stmt.unwrap());
      }
    }
    return success(stmts);
  };
  const parseExpression = () => {
    state.next();
    return expr();
  };
  const run = () => {
    state.next(); // prime the state
    return program();
  };
  return {
    run,
    tokenize: () => state.tokens,
    parseExpression,
  };
};

class Operand implements ExprVisitor<Expr> {
  i: number;
  constructor(operandIndex: number) {
    this.i = operandIndex;
  }
  evalnode(node: Expr) {
    return node.acceptExprOp(this);
  }
  nil(node: Nil): Expr {
    return node;
  }
  bool(node: Bool): Expr {
    return node;
  }
  string(node: Str): Expr {
    return node;
  }
  symbol(node: Sym): Expr {
    return node;
  }
  num(node: Num): Expr {
    return node;
  }
  group(node: Group): Expr {
    return this.evalnode(node.expression);
  }
  relation(node: Relation): Expr {
    return mod(2, this.i) === 0 ? node.right : node.left;
  }
  binary(node: Binary): Expr {
    return mod(2, this.i) === 0 ? node.right : node.left;
  }
  ratio(node: Ratio): Expr {
    return mod(2, this.i) === 0 ? int(node.n) : int(node.d);
  }
  unary(node: Unary): Expr {
    return node.arg;
  }
  call(node: Call): Expr {
    return node.args[mod(node.number_of_operands(), this.i)];
  }
  nativeCall(node: NativeCall): Expr {
    return node.args[mod(node.number_of_operands(), this.i)];
  }
  assignment(node: Assignment): Expr {
    return node.expr;
  }
}

const parens = (s: string | number) => `(${s})`;
const concat = (s: (string | number)[]) => s.join("");
const commaSep = (s: (string | number)[]) => s.join(",");

const construct = (f: Operator, args: (string | number)[]) => {
  const op: string = f;
  let expr: string = "";
  if (f.startsWith("call")) {
    const [_, b] = f.split("-");
    expr = concat([b, parens(commaSep(args))]);
  } else {
    expr = args.join(op);
  }
  return parse(expr).parseExpression();
};

const freeOf = (
  u: string,
  t: string,
) => (
  stringUnion(u, t) === -1 ? true : false
);

const operand = (u: Either<Err, Expr>, i: number) => (
  u.map((u) => new Operand(i - 1).evalnode(u))
);
const src = `
let apple_ = 5;
let bananas_ = 10;
`;
const k = parse(src).run();
print(strTree(k));
