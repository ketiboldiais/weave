import { Complex, floor, Fraction } from "./util.js";
import {
  dne,
  Either,
  isDigit,
  isGreekLetterName,
  isLatinGreek,
  Left,
  left,
  print,
  Right,
  right,
  zip,
} from "./util.js";
import { bp } from "./bp.js";

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
        root.kind = tt[root.kind] as any;
        root.nodeclass = nk[root.nodeclass] as any;
      }
      if (
        root instanceof Binary || root instanceof RelationExpr ||
        root instanceof LogicalExpr
      ) {
        root.op = root.op.lex as any;
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

// deno-fmt-ignore
export enum tt {
  eof, error,empty,
  lparen, rparen,
  lbrace, rbrace,
  comma, dot, minus,
  plus, semicolon, slash,
  star, bang, neq, eq,
  deq, gt, lt, leq, geq,
  caret,percent,
  symbol, string,int,frac,complex,
  float,scientific,
  rem,mod,null,bool,
  call,
  colon,
  lbracket,
  rbracket,
  // type operators
  arrow,amp,vbar,tilde,
  // logical operators
  and,nor,xnor,nand,
  not,or,xor,
  // keywords
  fn, let, begin, end, if, else,
  constant,while,for,
  // type annotations
  typename,
}
type Numeric = tt.float | tt.int | tt.scientific | tt.frac | tt.complex;
type UnaryOperator = tt.minus | tt.plus | tt.bang;
type RelationalOperator = tt.lt | tt.gt | tt.deq | tt.neq | tt.leq | tt.geq;
type BooleanOperator =
  | tt.and
  | tt.nor
  | tt.xnor
  | tt.nand
  | tt.not
  | tt.or
  | tt.xor;
type BinaryOperator =
  | tt.star
  | tt.plus
  | tt.caret
  | tt.minus
  | tt.slash
  | tt.rem
  | tt.percent;
type ArithmeticOperator =
  | tt.minus
  | tt.plus
  | tt.slash
  | tt.star
  | tt.caret
  | tt.percent
  | tt.rem
  | tt.mod;

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
 * Returns a new parser error.
 */
const parserError = (message: string) => (
  new Err(message, "syntax")
);
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
      this.type === tt.frac ||
      this.type === tt.int ||
      this.type === tt.float ||
      this.type === tt.scientific
    );
  }

  /**
   * Returns true if this operator
   * is a {@link UnaryOperator} token.
   */
  unary(): this is Token<UnaryOperator> {
    return (
      this.type === tt.minus ||
      this.type === tt.plus ||
      this.type === tt.bang
    );
  }

  binary(): this is Token<BinaryOperator> {
    return (
      this.type === tt.star ||
      this.type === tt.plus ||
      this.type === tt.caret ||
      this.type === tt.slash ||
      this.type === tt.rem ||
      this.type === tt.percent
    );
  }

  /**
   * Returns true if this
   * token is a {@link RelationalOperator}
   * token.
   */
  relational(): this is Token<RelationalOperator> {
    return (
      this.type === tt.lt ||
      this.type === tt.gt ||
      this.type === tt.deq ||
      this.type === tt.neq ||
      this.type === tt.leq ||
      this.type === tt.geq
    );
  }

  logic(): this is Token<BooleanOperator> {
    return (
      this.type === tt.and ||
      this.type === tt.nor ||
      this.type === tt.xnor ||
      this.type === tt.nand ||
      this.type === tt.nor ||
      this.type === tt.or ||
      this.type === tt.xor
    );
  }

  /**
   * Returns true if this token
   * matches the provided type.
   */
  is(type: T) {
    return this.type === type;
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.type === types[i]) return true;
    }
    return false;
  }

  /**
   * Returns true if this token is an
   * {@link ArithmeticOperator} token.
   */
  arithmetic(): this is Token<ArithmeticOperator> {
    return (
      this.type === tt.minus ||
      this.type === tt.plus ||
      this.type === tt.slash ||
      this.type === tt.star ||
      this.type === tt.caret ||
      this.type === tt.percent ||
      this.type === tt.rem ||
      this.type === tt.mod
    );
  }

  /**
   * The token representation of the empty token,
   * used primarily as a placeholder and base
   * case.
   */
  static empty = new Token(tt.empty, "", -1);
}

/**
 * Returns a new token.
 */
const tkn = <T extends tt>(type: T, lex: string, line: number) => (
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
    const out = tkn(tt.error, message, line);
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
    return token(tt.string);
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
      if (type === tt.int) {
        type = tt.frac;
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
      type = tt.float;
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
        type = tt.scientific;
        tick(); // eat the 'E'
        while (isDigit(peek())) tick();
      } else if (
        ((peekNext() === "+") || (peekNext() === "-")) && isDigit(nextChar(2))
      ) {
        // This is a scientific with the form [float] E (+|-) [int]
        type = tt.scientific;
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
    if (match("[")) {
      const t = tick();
      if (t !== "]") {
        return errorToken(`Malformed array signature.`);
      }
      return token(tt.typename);
    }
    // deno-fmt-ignore
    switch (s) {
      case 'rational':
      case 'bool':
      case 'string':
      case 'complex':
      case 'float':
      case 'int': return token(tt.typename);
			case 'false':
			case 'true': return token(tt.bool);
      case 'while': return token(tt.while);
      case 'for': return token(tt.for);
      case 'fn': return token(tt.fn);
      case 'let': return token(tt.let);
      case 'begin': return token(tt.begin);
      case 'end': return token(tt.end);
      case 'if': return token(tt.if);
      case 'else': return token(tt.else);
			case 'rem': return token(tt.rem);
			case 'mod': return token(tt.mod);
			case 'nan': return token(tt.constant);
			case 'inf': return token(tt.constant);
			case 'nil': return token(tt.null);
      case 'and': return token(tt.and);
      case 'nor': return token(tt.nor);
      case 'nand': return token(tt.nand);
      case 'not': return token(tt.not);
      case 'or': return token(tt.or);
      case 'xor': return token(tt.xor);
		}

    if (functions.has(s)) {
      return token(tt.call);
    }
    return token(tt.symbol);
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
    if (atEnd()) return token(tt.eof);
    const c = tick();
    if (isLatinGreek(c)) return word();
    if (isDigit(c)) return number(tt.int);
    if (c === "." && isDigit(peek())) return number(tt.float);
    // deno-fmt-ignore
    switch (c) {
      case ':': return token(tt.colon);
      case '&': return token(tt.amp);
      case '~': return token(tt.tilde);
      case '|': return token(tt.vbar);
      case "(": return token(tt.lparen);
      case ")": return token(tt.rparen);
      case "[": return token(tt.lbracket);
      case "]": return token(tt.rbracket);
      case "{": return token(tt.lbrace);
      case "}": return token(tt.rbrace);
      case ",": return token(tt.comma);
      case ".": return token(tt.dot);
      case "-": return token(match('>') ? tt.arrow : tt.minus);
      case "+": return token(tt.plus);
      case "*": return token(tt.star);
      case "%": return token(tt.percent);
      case ';': return token(tt.semicolon);
			case '/': return token(tt.slash);
			case '^': return token(tt.caret);
			case '!': return token(match('=') ? tt.neq : tt.bang);
			case '=': return token(match('=') ? tt.deq : tt.eq);
			case '<': return token(match('=') ? tt.leq : tt.lt);
			case '>': return token(match('=') ? tt.geq : tt.gt);
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

  const tokenlist = () => {
    const out = tokenize();
    if (out.isLeft()) {
      return [`Error:${out.unwrap().message}`];
    } else return out.unwrap().map((c) => `${tt[c.type]}: ${c.lex}`);
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
    tokenlist,
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
const symsplit = (tokens: Token[]) => {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t1 = tokens[i];
    const t2 = tokens[i + 1] || Token.empty;
    out.push(t1);
    if (
      t2.is(tt.symbol) && !isGreekLetterName(t2.lex) && !t2.lex.includes("_") &&
      !t2.lex.startsWith("$") && !t1.is(tt.colon) && !t1.is(tt.arrow)
    ) {
      t2.lex.split("").map((c) => tkn(tt.symbol, c, t2.line)).forEach((v) =>
        out.push(v)
      );
      i++;
      continue;
    }
  }
  return out;
};

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
    if (now.is(tt.rparen)) {
      if (nxt.is(tt.symbol)) {
        out.push(nxt.copy(tt.star, "*"));
      } else if (nxt.is(tt.lparen)) {
        out.push(nxt.copy(tt.star, "*"));
      }
    } else if (now.isnum() && nxt.is(tt.call)) {
      out.push(nxt.copy(tt.star, "*"));
    } else if (now.isnum() && nxt.is(tt.symbol)) {
      out.push(nxt.copy(tt.star, "*"));
    } else if (now.isnum() && nxt.is(tt.lparen)) {
      out.push(nxt.copy(tt.star, "*"));
    } else if (now.is(tt.symbol) && nxt.is(tt.symbol)) {
      out.push(nxt.copy(tt.symbol, "*"));
    }
  }
  out.push(tkns[tkns.length - 1]);
  return out;
};

export interface Visitor<T> {
  int(node: Integer): T;
  symbol(node: Sym): T;
  float(node: Float): T;
  complex(node: ComplexNode): T;
  rational(node: Rational): T;
  constant(node: Atom): T;
  binary(node: Binary): T;
  unary(node: Unary): T;
  tuple(node: TupleExpr): T;
  set(node: SetExpr): T;
  relation(node: RelationExpr): T;
  logicExpr(node: LogicalExpr): T;
  algebraicCall(node: AlgebraicCall): T;
  algebraicGroup(node: AlgebraicGroup): T;
  group(node: Group): T;
  fnCall(node: FnCall): T;
  assign(node: AssignExpr): T;
  blockStmt(node: BlockStmt): T;
  exprStmt(node: ExprStmt): T;
  functionStmt(node: FunctionStmt): T;
  ifStmt(node: IfStmt): T;
  varStmt(node: VariableStmt): T;
  loopStmt(node: LoopStmt): T;
  typesymbol(node: TypeSymbol): T;
  typeInfix(node: TypeInfix): T;
  typeGroup(node: TypeGroup): T;
  typeFn(node: TypeFn): T;
  typeUnary(node: TypeUnary): T;
  typeTuple(node: TypeTuple): T;
}
export interface Algebra<T> {
  int(node: Integer): T;
  symbol(node: Sym): T;
  float(node: Float): T;
  complex(node: ComplexNode): T;
  rational(node: Rational): T;
  binary(node: Binary): T;
  unary(node: Unary): T;
  algebraicCall(node: AlgebraicCall): T;
  algebraicGroup(node: AlgebraicGroup): T;
}
export interface TypeVisitor<T> {
  symbol(node: TypeSymbol): T;
  infix(node: TypeInfix): T;
  group(node: TypeGroup): T;
  fn(node: TypeFn): T;
  unary(node: TypeUnary): T;
  tuple(node: TypeTuple): T;
}

export enum nk {
  statement,
  type_expression,
  algebraic_expression,
  nonalgebraic_expression,
}

export abstract class ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  kind: tt;
  nodeclass: nk;
  constructor(type: tt, kind: nk) {
    this.kind = type;
    this.nodeclass = kind;
  }
}

const algebraic = (node: ASTNode): node is AlgebraicExpr => (
  node.nodeclass === nk.algebraic_expression
);

export class Program {
  code: Statement[];
  error: Err | null;
  constructor(code: Statement[], error: Err | null) {
    this.code = code;
    this.error = error;
  }
}
const success = (code: Statement[]) => (
  new Program(code, null)
);
const failure = (error: Err) => (
  new Program([], error)
);

export abstract class Statement extends ASTNode {
  constructor(type: tt) {
    super(type, nk.statement);
  }
}

export class LoopStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loopStmt(this);
  }
  condition: Expr;
  body: Statement;
  constructor(condition: Expr, body: Statement) {
    super(tt.while);
    this.condition = condition;
    this.body = body;
  }
}

export class IfStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ifStmt(this);
  }
  condition: Expr;
  then: Statement;
  alt: Statement;
  constructor(condition: Expr, then: Statement, alt: Statement) {
    super(tt.if);
    this.condition = condition;
    this.then = then;
    this.alt = alt;
  }
}
const ifStmt = (condition: Expr, then: Statement, alt: Statement) => (
  new IfStmt(condition, then, alt)
);

export class VariableStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.varStmt(this);
  }
  name: Sym;
  init: Expr;
  constructor(name: Sym, init: Expr) {
    super(tt.let);
    this.name = name;
    this.init = init;
  }
}
const varstmt = (name: Sym, init: Expr) => (
  new VariableStmt(name, init)
);

export class FunctionStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.functionStmt(this);
  }
  name: string;
  params: Sym[];
  body: Statement;
  returns: TypeExpression;
  constructor(
    name: string,
    params: Sym[],
    body: Statement,
    returns: TypeExpression,
  ) {
    super(tt.fn);
    this.name = name;
    this.params = params;
    this.body = body;
    this.returns = returns;
  }
}
const fnStmt = (
  name: string,
  params: Sym[],
  body: Statement,
  returns: TypeExpression,
) => (
  new FunctionStmt(name, params, body, returns)
);

export class ExprStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.exprStmt(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(expr.kind);
    this.expr = expr;
  }
}
const exprStmt = (expr: Expr) => (
  new ExprStmt(expr)
);

export class BlockStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.blockStmt(this);
  }
  stmts: Statement[];
  constructor(stmts: Statement[]) {
    super(tt.begin);
    this.stmts = stmts;
  }
}
const block = (statements: Statement[]) => (
  new BlockStmt(statements)
);

export abstract class Expr extends ASTNode {
  constructor(
    type: tt,
    nodeclass:
      | nk.algebraic_expression
      | nk.nonalgebraic_expression
      | nk.type_expression,
  ) {
    super(type, nodeclass);
  }
}
const isExpr = (node: ASTNode): node is Expr => (
  node.nodeclass === nk.algebraic_expression ||
  node.nodeclass === nk.nonalgebraic_expression
);

export abstract class NonalgebraicExpr extends Expr {
  constructor(type: tt) {
    super(type, nk.nonalgebraic_expression);
  }
}

export abstract class TypeExpression extends Expr {
  abstract acceptTyper<T>(typer: TypeVisitor<T>): T;
  constructor(type: tt) {
    super(type, nk.type_expression);
  }
}
const isTypeExpr = (node: ASTNode): node is TypeExpression => (
  node.nodeclass === nk.type_expression ||
  node.kind === tt.symbol ||
  node.kind === tt.typename
);

class TypeSymbol extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.symbol(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typesymbol(this);
  }
  id: string;
  constructor(type: string) {
    super(tt.typename);
    this.id = type;
  }
}
const typeUnknown = new TypeSymbol("unknown");
const typesymbol = (name: string) => {
  let n = name;
  switch (name) {
    case "Q":
      n = "rational";
      break;
    case "R":
      n = "float";
      break;
    case "Z":
      n = "int";
      break;
    case "C":
      n = "complex";
      break;
  }
  return new TypeSymbol(n);
};
type TypeOperator = tt.arrow | tt.amp | tt.vbar;

class TypeUnary extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.unary(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typeUnary(this);
  }
  op: tt.tilde = tt.tilde;
  arg: TypeExpression;
  constructor(arg: TypeExpression) {
    super(tt.tilde);
    this.arg = arg;
  }
}
const typeUnary = (arg: TypeExpression) => (
  new TypeUnary(arg)
);

class TypeTuple extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.tuple(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typeTuple(this);
  }
}

class TypeInfix extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.infix(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typeInfix(this);
  }
  left: TypeExpression;
  op: Token<TypeOperator>;
  right: TypeExpression;
  constructor(
    left: TypeExpression,
    op: Token<TypeOperator>,
    right: TypeExpression,
  ) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}
const typeInfix = (
  left: TypeExpression,
  op: Token<TypeOperator>,
  right: TypeExpression,
) => (
  new TypeInfix(left, op, right)
);
class TypeGroup extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.group(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typeGroup(this);
  }
  typeExpr: TypeExpression;
  constructor(typeExpr: TypeExpression) {
    super(tt.lparen);
    this.typeExpr = typeExpr;
  }
}
const typeGroup = (expr: TypeExpression) => (
  new TypeGroup(expr)
);

class TypeFn extends TypeExpression {
  acceptTyper<T>(typer: TypeVisitor<T>): T {
    return typer.fn(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.typeFn(this);
  }
  params: TypeExpression[];
  returns: TypeExpression;
  constructor(params: TypeExpression[], returns: TypeExpression) {
    super(tt.arrow);
    this.params = params;
    this.returns = returns;
  }
}

export class FnCall extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fnCall(this);
  }
  callee: Expr;
  args: Expr[];
  constructor(callee: Expr, args: Expr[]) {
    super(tt.rparen);
    this.callee = callee;
    this.args = args;
  }
}
const fnCall = (callee: Expr, args: Expr[]) => (
  new FnCall(callee, args)
);

export class Atom extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.constant(this);
  }
  s: string | null | boolean;
  type: tt.string | tt.null | tt.bool;
  constructor(s: string | null | boolean, type: tt.string | tt.null | tt.bool) {
    super(type);
    this.s = s;
    this.type = type;
  }
}
export const str = (value: string) => (
  new Atom(value, tt.string)
);
export const nil = () => (
  new Atom(null, tt.null)
);

export const bool = (value: boolean) => (
  new Atom(value, tt.bool)
);

export class AssignExpr extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assign(this);
  }
  name: Sym;
  init: Expr;
  constructor(name: Sym, init: Expr) {
    super(tt.eq);
    this.name = name;
    this.init = init;
  }
}
const assignment = (name: Sym, init: Expr) => (
  new AssignExpr(name, init)
);

class LogicalExpr extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicExpr(this);
  }
  left: Expr;
  op: Token<BooleanOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BooleanOperator>, right: Expr) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}
const logic = (left: Expr, op: Token<BooleanOperator>, right: Expr) => (
  new LogicalExpr(left, op, right)
);

export class RelationExpr extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relation(this);
  }
  left: Expr;
  op: Token<RelationalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<RelationalOperator>, right: Expr) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export class SetExpr extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.set(this);
  }
  elements: Expr[];
  constructor(elements: Expr[]) {
    super(tt.lbrace);
    this.elements = elements;
  }
}
const setExpr = (elements: Expr[]) => (
  new SetExpr(elements)
);

export class TupleExpr extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.tuple(this);
  }
  elements: Expr[];
  constructor(elements: Expr[]) {
    super(tt.lbracket);
    this.elements = elements;
  }
}
const tupleExpr = (elements: Expr[]) => (
  new TupleExpr(elements)
);

export class Group extends NonalgebraicExpr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.group(this);
  }
  expression: NonalgebraicExpr;
  constructor(expression: NonalgebraicExpr) {
    super(tt.lparen);
    this.expression = expression;
  }
}
const group = (expr: NonalgebraicExpr) => (
  new Group(expr)
);

export const relation = (
  left: Expr,
  op: Token<RelationalOperator>,
  right: Expr,
) => (
  new RelationExpr(left, op, right)
);

export abstract class AlgebraicExpr extends Expr {
  abstract map<T>(algebra: Algebra<T>): T;
  constructor(type: tt) {
    super(type, nk.algebraic_expression);
  }
}

export class ComplexNode extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.complex(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.complex(this);
  }
  n: Complex;
  constructor(n: Complex) {
    super(tt.complex);
    this.n = n;
  }
}

export class Rational extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.rational(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.rational(this);
  }
  value: Fraction;
  constructor(value: Fraction) {
    super(tt.frac);
    this.value = value;
  }
}

export class AlgebraicGroup extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.algebraicGroup(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicGroup(this);
  }
  expression: AlgebraicExpr;
  constructor(expression: AlgebraicExpr) {
    super(tt.lparen);
    this.expression = expression;
  }
}
const algebraGroup = (expression: AlgebraicExpr) => (
  new AlgebraicGroup(expression)
);

export class AlgebraicCall extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.algebraicCall(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.algebraicCall(this);
  }
  callee: string;
  args: AlgebraicExpr[];
  constructor(callee: string, args: AlgebraicExpr[]) {
    super(tt.call);
    this.callee = callee;
    this.args = args;
  }
}
const algebraCall = (callee: string, args: AlgebraicExpr[]) => (
  new AlgebraicCall(callee, args)
);

export class Unary extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.unary(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.unary(this);
  }
}

export class Binary extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.binary(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binary(this);
  }
  left: AlgebraicExpr;
  op: Token<BinaryOperator>;
  right: AlgebraicExpr;
  constructor(
    left: AlgebraicExpr,
    op: Token<BinaryOperator>,
    right: AlgebraicExpr,
  ) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}
export const binex = (
  left: AlgebraicExpr,
  op: Token<BinaryOperator>,
  right: AlgebraicExpr,
) => (
  new Binary(left, op, right)
);

export class Float extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.float(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.float(this);
  }
  n: number;
  constructor(n: number) {
    super(tt.float);
    this.n = n;
  }
}
export const float = (value: string | number) => (
  new Float(+value)
);

export class Integer extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.int(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.int(this);
  }
  n: number;
  constructor(value: number) {
    super(tt.int);
    this.n = value;
  }
}
export const int = (value: number | string) => (
  new Integer(floor(+value))
);

export class Sym extends AlgebraicExpr {
  map<T>(algebra: Algebra<T>): T {
    return algebra.symbol(this);
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.symbol(this);
  }
  s: string;
  type: TypeExpression;
  constructor(value: string, type: TypeExpression) {
    super(tt.symbol);
    this.s = value;
    this.type = type;
  }
  entype(type: TypeExpression) {
    return new Sym(
      this.s,
      type,
    );
  }
}
export const sym = (value: string, type: TypeExpression = typeUnknown) => (
  new Sym(value, type)
);
const isSymbol = (node: ASTNode): node is Sym => (
  node.kind === tt.symbol
);

// =====================================================================
// § - Parser State
// =====================================================================
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
  nativeFns = new Set<string>([
    "cos",
    "sin",
    "tan",
    "lg",
    "ln",
    "log",
    "sum",
    "prod",
  ]);
  isNative(name: string) {
    return this.nativeFns.has(name);
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
  matches(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.peek.is(types[i])) {
        this.next();
        return true;
      }
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
    return tkn(tt.eof, "", this.max);
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
      : tkn(tt.eof, "eof", 1);
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
      this.peek.is(tt.eof) ||
      this.peek.is(tt.eof) ||
      this.peek.is(tt.end) ||
      this.atEnd()
    );
  }
}

type Parslet = (
  current: Token,
  lastnode: Expr,
) => Either<Err, Expr>;
type PEntry = [Parslet, Parslet, bp];
type PSpec = Record<tt, PEntry>;

const parse = (input: string) => {
  const state = ParserState.of(input);
  const expected = (exp: string, actual: string) => (
    `Expected ${exp}, got “${actual}”`
  );
  const __: Parslet = (t) => {
    if (state.error) return left(state.error);
    return state.err(`Unexpected expression: ${t.lex}`, expr.name);
  };
  /**
   * Parses a scientific number.
   */
  const scientific: Parslet = (prev) => {
    const lex = prev.lex;
    if (!prev.is(tt.scientific)) {
      return state.err(expected("scientific number", lex), "SCI");
    }
    const [n, d] = lex.split("E");
    const base = Number.isInteger(+n) ? int(n) : float(n);
    const exp = binex(int("10"), tkn(tt.caret, "^", prev.line), int(d));
    return state.ok(binex(base, tkn(tt.star, "*", prev.line), exp));
  };

  const logicInfix: Parslet = (op, node) => {
    const p = precof(op.type);
    return expr(p).chain((n) => {
      return state.ok(logic(node, op as Token<BooleanOperator>, n));
    });
  };

  const assign: Parslet = (_, node) => {
    if (!isSymbol(node)) {
      return state.err(`Invalid assignment target`, `assign`);
    }
    return expr().chain((n) => state.ok(assignment(node, n)));
  };

  const compare: Parslet = (op, node) => {
    const p = precof(op.type);
    return expr(p).chain((n) => {
      return state.ok(relation(node, op as Token<RelationalOperator>, n));
    });
  };
  const typeBinex: Parslet = (op, node) => {
    const erm = `Operator ${op.lex} is only valid in type annotations.`;
    const src = `typenote-infix`;
    if (!isTypeExpr(node)) {
      return state.err(erm, src);
    }
    const p = precof(op.type);
    return expr(p).chain((n) => {
      if (!isTypeExpr(n)) {
        return state.err(erm, src);
      }
      const lhs = isSymbol(node) ? typesymbol(node.s) : node;
      const rhs = isSymbol(n) ? typesymbol(n.s) : n;
      return state.ok(typeInfix(lhs, op as Token<TypeOperator>, rhs));
    });
  };

  const infix: Parslet = (op, node) => {
    const erm = `Operator ${tt[op.type]} may only be used on algebras.`;
    const src = "infix";
    if (!algebraic(node)) {
      return state.err(erm, src);
    }
    const p = precof(op.type);
    return expr(p).chain((n) => {
      if (!algebraic(n)) return state.err(erm, src);
      return state.ok(binex(node, op as Token<BinaryOperator>, n));
    });
  };

  /**
   * Parses an atom.
   */
  const atom: Parslet = (prev) => {
    const type = prev.type;
    const lex = prev.lex;
    // deno-fmt-ignore
    switch (type) {
      case tt.int: return state.ok(int(lex));
			case tt.float: return state.ok(float(lex));
      case tt.symbol: return state.ok(sym(lex));
			case tt.bool: return state.ok(bool(lex==='true'))
      case tt.string: return state.ok(str(lex));
			case tt.null: return state.ok(nil());
      default: return state.err(expected("atom", lex), "atom");
    }
  };

  const native: Parslet = (op) => {
    const lex = op.lex;
    const src = `native`;
    if (!state.isNative(lex)) {
      return state.err(`Unexpected native call`, src);
    }
    if (!state.nextIs(tt.lparen)) {
      return state.err(`Expeced “(” to open arguments`, src);
    }
    let args: AlgebraicExpr[] = [];
    if (!state.check(tt.rparen)) {
      do {
        const e = expr();
        if (e.isLeft()) return e;
        const node = e.unwrap();
        if (!algebraic(node)) {
          return state.err(`Native functions only accept algebras`, src);
        }
        args.push(node);
      } while (state.nextIs(tt.comma));
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(expected(")", state.peek.lex), src);
    }
    return state.ok(algebraCall(lex, args));
  };

  const typeNot: Parslet = (op) => {
    const src = `type-not`;
    const p = precof(op.type);
    return expr(p).chain((n) => {
      if (!isTypeExpr(n)) {
        return state.err(`Operator ${op.lex} is only valid on type notes`, src);
      } else {
        let k = n;
        if (isSymbol(n)) {
          k = typesymbol(n.s);
        }
        return state.ok(typeUnary(k));
      }
    });
  };

  const prefix: Parslet = (op) => {
    const src = `unary-prefix`;
    const p = precof(op.type);
    return expr(p).chain((n) => {
      if (!algebraic(n)) {
        return state.err(
          `Operator ${op.lex} may only be used on algebras`,
          src,
        );
      } else {
        return state.ok(algebraCall(op.lex, [n]));
      }
    });
  };
  const postfix: Parslet = (op, node) => {
    const src = `unary-postfix`;
    if (op.type !== tt.bang) {
      return state.err(`Operator ! may only be used on algebras`, src);
    }
    if (!algebraic(node)) {
      return state.err(`Operator ! may only be used on algebras`, src);
    }
    return state.ok(algebraCall("!", [node]));
  };

  const primary = () => {
    const innerExpr = expr();
    if (innerExpr.isLeft()) return innerExpr;
    state.next();
    const node = innerExpr.unwrap();
    if (algebraic(node)) {
      return state.ok(algebraGroup(node));
    } else if (isTypeExpr(node)) {
      return state.ok(typeGroup(node));
    } else {
      return state.ok(group(node));
    }
  };
  const callExpr: Parslet = (_, node) => {
    const callee = node;
    let args: Expr[] = [];
    if (!state.check(tt.rparen)) {
      const arglist = comlist(isExpr, `Expected expression`, "call");
      if (arglist.isLeft()) return arglist;
      args = arglist.unwrap();
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(`Expected “)” to close args`, "call");
    }
    return state.ok(fnCall(callee, args));
  };

  const __o = bp.nil;

  const rules: PSpec = {
    [tt.eof]: [__, __, __o],
    [tt.error]: [__, __, __o],
    [tt.empty]: [__, __, __o],
    [tt.lparen]: [primary, callExpr, bp.call],
    [tt.rparen]: [__, __, __o],
    [tt.lbrace]: [__, __, __o],
    [tt.rbrace]: [__, __, __o],
    [tt.comma]: [__, __, __o],
    [tt.dot]: [__, __, __o],

    [tt.semicolon]: [__, __, __o],
    [tt.bang]: [__, postfix, bp.call],
    // assignment
    [tt.eq]: [__, assign, bp.assign],
    // comparison
    [tt.deq]: [__, compare, bp.eq],
    [tt.neq]: [__, compare, bp.rel],
    [tt.gt]: [__, compare, bp.rel],
    [tt.lt]: [__, compare, bp.rel],
    [tt.leq]: [__, compare, bp.rel],
    [tt.geq]: [__, compare, bp.rel],
    // binary operators
    [tt.minus]: [prefix, infix, bp.sum],
    [tt.plus]: [prefix, infix, bp.sum],
    [tt.star]: [__, infix, bp.prod],
    [tt.slash]: [__, infix, bp.prod],
    [tt.percent]: [__, infix, bp.quot],
    [tt.rem]: [__, infix, bp.quot],
    [tt.mod]: [__, infix, bp.quot],
    [tt.caret]: [__, infix, bp.pow],
    // logic operators
    [tt.or]: [__, logicInfix, bp.or],
    [tt.and]: [__, logicInfix, bp.and],
    [tt.nor]: [__, logicInfix, bp.nor],
    [tt.xnor]: [__, logicInfix, bp.xnor],
    [tt.nand]: [__, logicInfix, bp.nand],
    [tt.xor]: [__, logicInfix, bp.xor],
    [tt.not]: [__, __, __o],

    // atoms
    [tt.symbol]: [atom, __, bp.atom],
    [tt.string]: [atom, __, bp.atom],
    [tt.int]: [atom, __, bp.atom],
    [tt.frac]: [__, __, __o],
    [tt.complex]: [__, __, __o],
    [tt.float]: [__, __, __o],
    [tt.scientific]: [scientific, __, bp.atom],

    [tt.null]: [__, __, __o],
    [tt.bool]: [__, __, __o],
    [tt.call]: [native, __, bp.call],
    [tt.colon]: [__, __, __o],
    [tt.lbracket]: [__, __, __o],
    [tt.rbracket]: [__, __, __o],

    // type operators
    [tt.arrow]: [__, typeBinex, bp.typeinfix],
    [tt.amp]: [__, typeBinex, bp.typeinfix],
    [tt.vbar]: [__, typeBinex, bp.typeinfix],
    [tt.tilde]: [typeNot, __, bp.typeunary],

    // keywords
    [tt.fn]: [__, __, __o],
    [tt.let]: [__, __, __o],
    [tt.begin]: [__, __, __o],
    [tt.end]: [__, __, __o],
    [tt.if]: [__, __, __o],
    [tt.else]: [__, __, __o],
    [tt.constant]: [__, __, __o],
    [tt.while]: [__, __, __o],
    [tt.for]: [__, __, __o],
    [tt.typename]: [__, __, bp.atom],
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

  const expr = (minbp: number = bp.lowest) => {
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
  const FN = () => {
    // fn eaten in STMT
    const f = state.next();
    const src = `function-statement`;
    if (!f.is(tt.symbol)) {
      return state.err(`Expected function name`, src);
    }
    let params: Sym[] = [];
    if (!state.nextIs(tt.lparen)) {
      return state.err(`Expected “(” to open params`, src);
    }
    if (!state.peek.is(tt.rparen)) {
      const elems = comlist(isSymbol, `Expected symbol list`, src);
      if (elems.isLeft()) return elems;
      params = elems.unwrap();
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(`Expected “)” to close params`, src);
    }
    if (!state.nextIs(tt.colon)) {
      return state.err(`Expected “:” to begin type signature`, src);
    }
    let paramtypes: TypeExpression[] = [];
    if (state.nextIs(tt.lparen)) {
      const ptlist = comlist(isTypeExpr, `Expected type expressions`, src);
      if (ptlist.isLeft()) return ptlist;
      paramtypes = ptlist.unwrap().map((s) => {
        if (isSymbol(s)) {
          return typesymbol(s.s);
        } else return s;
      });
      if (!state.nextIs(tt.rparen)) {
        return state.err(`Expected “)” to close parameter types`, src);
      }
    } else {
      const pts = expr(100);
      if (pts.isLeft()) return pts;
      const t = pts.unwrap();
      if (isSymbol(t)) {
        paramtypes.push(typesymbol(t.s));
      } else if (isTypeExpr(t)) {
        paramtypes.push(t);
      }
    }
    if (paramtypes.length !== params.length) {
      return state.err(`Type signature parameters do not match`, src);
    }
    params.forEach((p, i) => {
      p.type = paramtypes[i];
    });

    if (!state.nextIs(tt.arrow)) {
      return state.err(`Expected “->” after param types`, src);
    }
    const returnType = expr(100);
    if (returnType.isLeft()) return returnType;
    if (!state.nextIs(tt.eq)) {
      return state.err(`Expected “=” to begin function definition`, src);
    }
    let rs = returnType.unwrap();
    if (isSymbol(rs)) {
      rs = typesymbol(rs.s);
    }
    if (!isTypeExpr(rs)) {
      return state.err(`Expected return type on right hand of “->”`, src);
    }
    const body = STMT();
    if (body.isLeft()) return body;
    return state.ok(
      fnStmt(f.lex, params, body.unwrap(), rs),
    );
  };
  const LET = () => {
    const name = state.next();
    const src = `let`;
    if (!name.is(tt.symbol)) {
      return state.err(`Expected symbol`, src);
    }
    let type = typeUnknown;
    if (state.nextIs(tt.colon)) {
      const t = state.next();
      if (!t.is(tt.symbol)) {
        return state.err(`Bad type annotation`, src);
      }
      type = typesymbol(t.lex);
    }
    if (!state.nextIs(tt.eq)) {
      return state.err(`Expected assign “=”`, src);
    }
    const init = EXPR();
    if (init.isLeft()) return init;
    const value = init.unwrap().expr;
    return state.ok(varstmt(sym(name.lex, type), value));
  };
  const IF = () => {
    // if eaten by stmt
    const condition = expr();
    if (condition.isLeft()) return condition;
    if (!state.nextIs(tt.begin)) {
      return state.err(`Expected block after if`, "if");
    }
    const ifbranch = BLOCK();
    if (ifbranch.isLeft()) return ifbranch;
    let elsebranch: Statement = exprStmt(nil());
    if (state.nextIs(tt.else)) {
      const _else = STMT();
      if (_else.isLeft()) return _else;
      elsebranch = _else.unwrap();
    }
    return state.ok(ifStmt(condition.unwrap(), ifbranch.unwrap(), elsebranch));
  };
  const comlist = <K extends Expr>(
    filter: (e: Expr) => e is K,
    errorMessage: string,
    src: string,
  ) => {
    const elements: K[] = [];
    do {
      const e = expr();
      if (e.isLeft()) return e;
      const element = e.unwrap();
      if (!filter(element)) return state.err(errorMessage, src);
      elements.push(element);
    } while (state.nextIs(tt.comma));
    return right(elements);
  };
  const BLOCK = () => {
    const stmts: Statement[] = [];
    while (!state.check(tt.end) && !state.atEnd()) {
      const stmt = STMT();
      if (stmt.isLeft()) return stmt;
      stmts.push(stmt.unwrap());
    }
    if (!state.nextIs(tt.end)) {
      return state.err(`Expected closing “end”`, "block");
    }
    return state.ok(block(stmts));
  };
  const EXPR = () => {
    const out = expr();
    if (out.isLeft()) return out;
    if (state.nextIs(tt.semicolon) || state.implicitSemicolonOk()) {
      return state.ok(exprStmt(out.unwrap()));
    }
    return state.err(`Expected “;” to end statement`, "expression");
  };
  const STMT = (): Left<Err> | Right<Statement> => {
    if (state.nextIs(tt.begin)) return BLOCK();
    if (state.nextIs(tt.let)) return LET();
    if (state.nextIs(tt.if)) return IF();
    if (state.nextIs(tt.fn)) return FN();
    return EXPR();
  };

  const program = () => {
    const stmts: Statement[] = [];
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

const src = `
fn f(x): R -> R = x^2 - x!;
`;
const j = parse(src).run();
print(treeof(j));
