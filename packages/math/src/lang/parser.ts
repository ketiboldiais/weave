import {
  Either,
  isDigit,
  isGreekLetterName,
  isLatinGreek,
  Left,
  left,
  Right,
  right,
  zip,
} from "./util.js";
import {
  BinaryOperator,
  BooleanOperator,
  bp,
  nc,
  nk,
  Numeric,
  RelationalOperator,
  tt,
} from "./enums.js";
import {
  assignment,
  ASTNode,
  Binary,
  binex,
  block,
  BlockStmt,
  bool,
  Expr,
  exprStmt,
  failure,
  float,
  fnCall,
  fnStmt,
  group,
  ifStmt,
  integer,
  isExpr,
  isSymbol,
  isVectorExpr,
  logic,
  LogicalExpr,
  loopStmt,
  matrixExpr,
  nativeCall,
  NativeFn,
  nil,
  nomen,
  notExpr,
  printStmt,
  relation,
  RelationExpr,
  returnStmt,
  Statement,
  str,
  success,
  varstmt,
  VectorExpr,
  vectorExpr,
} from "./nodes.core.js";
import { tkn, Token } from "./token.js";
import { Err, lexicalError, parserError } from "./err.js";

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
        root.kind = nk[root.kind] as any;
        root.nodeclass = nc[root.nodeclass] as any;
      }
      if (
        root instanceof Binary || root instanceof RelationExpr ||
        root instanceof LogicalExpr
      ) {
        root.op = root.op.lex as any;
      }
      if (root instanceof Token) {
        root.tokenType = tt[root.tokenType];
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

export const lexemes = (input: string): Token[] => {
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
     * [int] '//' [int]
     * ~~~
     * Both sides must be integers.
     */
    if (peekIs("/") && peekNext() === "/") {
      if (type === tt.int) {
        type = tt.frac;
        tick(); // eat the first '/'
        tick(); // eat the second '/'
        while (isDigit(peek()) && !atEnd()) {
          tick();
        }
      } else { // The `//` should always be followed by an integer
        return errorToken(`Expected integer after “//”`);
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

  const nativeFns: Record<NativeFn, boolean> = {
    sin: true,
    cos: true,
    tan: true,
    log: true,
    ln: true,
    "-": true,
    "+": true,
    "!": true,
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
    // @ts-ignore
    if (nativeFns[s]) {
      return token(tt.call);
    }
    // deno-fmt-ignore
    switch (s) {
			case 'false':
			case 'true': return token(tt.bool);
      case 'then': return token(tt.then);
      case 'return': return token(tt.return);
      case 'while': return token(tt.while);
      case 'for': return token(tt.for);
      case 'fn': return token(tt.fn);
      case 'let': return token(tt.let);
      case 'begin': return token(tt.begin);
      case 'end': return token(tt.end);
      case 'if': return token(tt.if);
      case 'else': return token(tt.else);
      case 'print': return token(tt.print);
			case 'rem': return token(tt.rem);
			case 'mod': return token(tt.mod);
			case 'nan': return token(tt.nan);
			case 'inf': return token(tt.inf);
			case 'null': return token(tt.null);
      case 'and': return token(tt.and);
      case 'nor': return token(tt.nor);
      case 'nand': return token(tt.nand);
      case 'not': return token(tt.not);
      case 'or': return token(tt.or);
      case 'xor': return token(tt.xor);
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
    if (atEnd()) return token(tt.eof, "EOF");
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
    let prev = Token.empty;
    let now = scan();
    out.push(now);
    let peek = scan();
    while (!atEnd()) {
      prev = now;
      now = peek;
      peek = scan();
      if (prev.isRPD() && now.is(tt.comma) && peek.isRPD()) {
        continue;
      }
      out.push(now);
    }
    out.push(peek);
    return out;
  };

  return tokenize();
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
export const symsplit = (tokens: Token[]) => {
  const out: Token[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const t1 = tokens[i];
    if (
      t1.is(tt.symbol) && !isGreekLetterName(t1.lex) && !t1.lex.includes("_") &&
      !t1.lex.startsWith("$")
    ) {
      t1.lex.split("").map((c) => tkn(tt.symbol, c, t1.line)).forEach((v) =>
        out.push(v)
      );
    } else {
      out.push(t1);
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
export const imul = (tkns: Token[]) => {
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
      out.push(nxt.copy(tt.star, "*"));
    }
  }
  out.push(tkns[tkns.length - 1]);
  return out;
};

export const coreFnScanner =
  <K extends string[]>(functions: K) => (tokens: Token[]) => {
    const functionNames = new Set(functions);
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.is(tt.symbol) && functionNames.has(token.lex)) {
        out.push(token.copy(tt.call));
      } else {
        out.push(token);
      }
    }
    return out;
  };

// =====================================================================
// § - Parser State
// =====================================================================
/**
 * An object encapsulation of
 * all global state data during
 * parsing.
 */
class ParserState {
  static of(source: Token[]) {
    return new ParserState(source);
  }
  error: null | Err = null;
  cursor: number = -1;
  /** The maximum cursor index. */
  max: number = 0;
  tokens: Token[];
  peek: Token = Token.empty;
  current: Token = Token.empty;
  line: number = 1;
  constructor(source: Token[]) {
    this.tokens = source;
    this.max = source.length - 1;
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
    this.line = this.current.line;
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
    const msg = `On line ${this.line}, while parsing ${source}: ${message}`;
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

const parse = (input: Token[]) => {
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
    const base = Number.isInteger(+n) ? integer(n) : float(n);
    const exp = binex(integer("10"), tkn(tt.caret, "^", prev.line), integer(d));
    return state.ok(binex(base, tkn(tt.star, "*", prev.line), exp));
  };

  const logicInfix: Parslet = (op, node) => {
    const p = precof(op.tokenType);
    return expr(p).chain((n) => {
      return state.ok(logic(node, op as Token<BooleanOperator>, n));
    });
  };

  const vector: Parslet = (prev) => {
    const elements: Expr[] = [];
    const vectors: VectorExpr[] = [];
    const src = `a vector`;
    let rows = 0;
    let cols = 0;
    if (!state.peek.is(tt.rbracket)) {
      do {
        const e = expr();
        if (e.isLeft()) return e;
        const element = e.unwrap();
        if (isVectorExpr(element)) {
          rows++;
          cols = element.elements.length;
          vectors.push(element);
        } else {
          elements.push(element);
        }
      } while (state.nextIs(tt.comma) && !state.atEnd());
    }
    if (!state.nextIs(tt.rbracket)) {
      return state.err(`Expected a right bracket “]” to close the vector`, src);
    }
    if (vectors.length !== 0) { // we parsed a matrix
      if (vectors.length !== cols) {
        return state.err(
          `Encountered a jagged matrix, which is prohibited`,
          src,
        );
      }
      return state.ok(matrixExpr(vectors, rows, cols));
    }
    return state.ok(vectorExpr(elements, prev.line));
  };

  const assign: Parslet = (_, node) => {
    if (!isSymbol(node)) {
      return state.err(`Invalid assignment target`, `assign`);
    }
    return expr().chain((n) => {
      if (!isExpr(n)) {
        return state.err(`Expected expression`, "assign");
      }
      return state.ok(assignment(node.name, n));
    });
  };

  const compare: Parslet = (op, node) => {
    const p = precof(op.tokenType);
    return expr(p).chain((n) => {
      return state.ok(relation(node, op as Token<RelationalOperator>, n));
    });
  };

  const infix: Parslet = (op, node) => {
    const p = precof(op.tokenType);
    return expr(p).chain((n) => {
      const out = binex(node, op as Token<BinaryOperator>, n);
      if (node.type === "int" && n.type === "int") {
        out.entype("int");
      }
      return state.ok(out);
    });
  };

  const rightInfix: Parslet = (op, node) => {
    return expr().chain((n) => {
      return state.ok(binex(node, op as Token<BinaryOperator>, n));
    });
  };

  /**
   * Parses an atom.
   */
  const atom: Parslet = (prev) => {
    const type = prev.tokenType;
    const lex = prev.lex;
    // deno-fmt-ignore
    switch (type) {
      case tt.int: return state.ok(integer(lex));
			case tt.float: return state.ok(float(lex));
      case tt.nan: return state.ok(float(NaN))
      case tt.inf: return state.ok(integer(Infinity))
      case tt.symbol: return state.ok(nomen(prev, '_'));
			case tt.bool: return state.ok(bool(lex==='true'))
      case tt.string: return state.ok(str(lex));
			case tt.null: return state.ok(nil());
      default: return state.err(expected("atom", lex), "atom");
    }
  };

  const native: Parslet = (op) => {
    const lex = op.lex;
    const src = `native`;
    if (!state.nextIs(tt.lparen)) {
      return state.err(`Expeced “(” to open arguments`, src);
    }
    let args: Expr[] = [];
    if (!state.check(tt.rparen)) {
      do {
        const e = expr();
        if (e.isLeft()) return e;
        const node = e.unwrap();
        args.push(node);
      } while (state.nextIs(tt.comma));
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(expected(")", state.peek.lex), src);
    }
    return state.ok(nativeCall(lex as NativeFn, args));
  };

  const logicalNot: Parslet = (op) => {
    const p = precof(op.tokenType);
    return expr(p).chain((n) => {
      return state.ok(notExpr(n));
    });
  };

  const prefix: Parslet = (op) => {
    const p = precof(op.tokenType);
    return expr(p).chain((n) => {
      if (op.lex === "-") {
        return state.ok(nativeCall("-", [n]));
      } else if (op.lex === "+") {
        return state.ok(nativeCall("+", [n]));
      } else {
        return state.err(`unknown prefix operator`, `prefix`);
      }
    });
  };

  const postfix: Parslet = (op, node) => {
    return state.ok(nativeCall("!", [node]));
  };

  const primary = () => {
    const innerExpr = expr();
    if (innerExpr.isLeft()) return innerExpr;
    state.next();
    const node = innerExpr.unwrap();
    return state.ok(group(node));
  };

  const callExpr: Parslet = (prev, node) => {
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
    return state.ok(fnCall(callee, args, prev.line));
  };

  const __o = bp.nil;

  const rules: PSpec = {
    [tt.eof]: [__, __, __o],
    [tt.error]: [__, __, __o],
    [tt.empty]: [__, __, __o],
    [tt.lparen]: [primary, callExpr, bp.call],
    [tt.rparen]: [__, __, __o],
    [tt.lbracket]: [vector, __, __o],
    [tt.rbracket]: [__, __, __o],
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
    [tt.caret]: [__, rightInfix, bp.pow],
    // logic operators
    [tt.or]: [__, logicInfix, bp.or],
    [tt.and]: [__, logicInfix, bp.and],
    [tt.nor]: [__, logicInfix, bp.nor],
    [tt.xnor]: [__, logicInfix, bp.xnor],
    [tt.nand]: [__, logicInfix, bp.nand],
    [tt.xor]: [__, logicInfix, bp.xor],
    [tt.not]: [logicalNot, __, bp.not],

    // atoms
    [tt.symbol]: [atom, __, bp.atom],
    [tt.string]: [atom, __, bp.atom],
    [tt.int]: [atom, __, bp.atom],
    [tt.float]: [atom, __, bp.atom],
    [tt.null]: [atom, __, bp.atom],
    [tt.bool]: [atom, __, bp.atom],
    [tt.nan]: [atom, __, bp.atom],
    [tt.inf]: [atom, __, bp.atom],
    [tt.frac]: [__, __, __o],
    [tt.complex]: [__, __, __o],
    [tt.scientific]: [scientific, __, bp.atom],

    [tt.colon]: [__, __, __o],

    // native core functions
    [tt.call]: [native, __, bp.call],

    // type operators
    [tt.arrow]: [__, __, __o],
    [tt.amp]: [__, __, __o],
    [tt.vbar]: [__, __, __o],
    [tt.tilde]: [__, __, __o],

    // keywords
    [tt.fn]: [__, __, __o],
    [tt.let]: [__, __, __o],
    [tt.begin]: [__, __, __o],
    [tt.end]: [__, __, __o],
    [tt.if]: [__, __, __o],
    [tt.else]: [__, __, __o],
    [tt.then]: [__, __, __o],
    [tt.while]: [__, __, __o],
    [tt.for]: [__, __, __o],
    [tt.return]: [__, __, __o],
    [tt.print]: [__, __, __o],
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
    const pre = prefixRule(token.tokenType);
    let lhs = pre(token, nil());
    if (lhs.isLeft()) return lhs;
    while (minbp < precof(state.peek.tokenType)) {
      if (state.atEnd()) break;
      token = state.next();
      const r = infixRule(token.tokenType);
      const rhs = r(token, lhs.unwrap());
      if (rhs.isLeft()) return rhs;
      lhs = rhs;
    }
    return lhs;
  };

  const FN = () => {
    // fn eaten in STMT
    const f = state.next();
    const src = `a function declaration`;
    if (!f.is(tt.symbol)) {
      return state.err(`Expected a symbol for the function’s name`, src);
    }
    let params: Token[] = [];
    if (!state.nextIs(tt.lparen)) {
      return state.err(
        `Expected the lexeme “(” to begin the parameter list`,
        src,
      );
    }
    if (!state.peek.is(tt.rparen)) {
      do {
        const e = state.next();
        if (!e.is(tt.symbol)) {
          return state.err(`Expected a symbol as a parameter`, src);
        }
        params.push(e);
      } while (state.nextIs(tt.comma));
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(
        `Expected the lexeme “)” to close the parameter list`,
        src,
      );
    }
    if (!state.nextIs(tt.colon)) {
      return state.err(
        `Expected the lexeme “:” to begin the type signature`,
        src,
      );
    }
    const paramTypes = [];
    while (!state.peek.is(tt.arrow) && !state.atEnd()) {
      const paramType = state.next();
      paramTypes.push(paramType);
    }
    if (!state.nextIs(tt.arrow)) {
      return state.err(
        `Expected the lexeme “->” to separate the return type`,
        src,
      );
    }
    const returnType = [];
    while (!state.peek.is(tt.eq) && !state.atEnd()) {
      const r = state.next();
      returnType.push(r);
    }
    if (!state.nextIs(tt.eq)) {
      return state.err(
        `Expected the lexeme “=” to separate the function’s body`,
        src,
      );
    }
    const body = STMT();
    if (body.isLeft()) return body;
    return state.ok(
      fnStmt(
        f,
        params,
        body.unwrap(),
        paramTypes.map((t) => t.lex).join(" "),
        returnType.map((t) => t.lex).join(" "),
      ),
    );
  };

  const LET = () => {
    const name = state.next();
    const src = `a variable declaration`;
    if (!name.is(tt.symbol)) {
      return state.err(`Expected symbol`, src);
    }
    let type: string = "_";
    if (state.nextIs(tt.colon)) {
      const typename = [];
      while (!state.peek.is(tt.eq) && !state.atEnd()) {
        const r = state.next();
        typename.push(r);
      }
      type = typename.map((c) => c.lex).join(" ");
    }
    if (!state.nextIs(tt.eq)) {
      return state.err(`Expected assignment operator “=”`, src);
    }
    const init = EXPR();
    if (init.isLeft()) return init;
    const value = init.unwrap().expr;
    if (value.isTyped()) {
      const inferredType = value.type;
      if (type !== "_" && inferredType !== type) {
        return state.err(
          `Variable annotated as “${type}” but a value of type ${inferredType} was assigned.`,
          src,
        );
      }
      type = inferredType;
    }
    return state.ok(varstmt(name, value, type));
  };

  const IF = () => {
    // if eaten by stmt
    const condition = expr();
    const src = `an if-statement`;
    if (condition.isLeft()) return condition;
    if (!state.nextIs(tt.then)) {
      return state.err(`Expected “then” after the if condition`, src);
    }
    const ifbranch = STMT();
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
    const n = out.unwrap();
    if (!isExpr(n)) {
      return state.err(`Expected expression`, "expr");
    }
    if (state.nextIs(tt.semicolon) || state.implicitSemicolonOk()) {
      return state.ok(exprStmt(out.unwrap()));
    }
    return state.err(`Expected “;” to end statement`, "expression");
  };

  const WHILE = () => {
    const src = `a while loop`;
    // while keyword eaten in STMT
    const condition = expr();
    if (condition.isLeft()) return condition;
    if (!state.nextIs(tt.begin)) {
      return state.err(`Expected a block after the condition`, src);
    }
    const stmts = BLOCK();
    if (stmts.isLeft()) return stmts;
    return state.ok(loopStmt(condition.unwrap(), stmts.unwrap()));
  };

  const FOR = () => {
    const src = `a for loop`;
    if (!state.nextIs(tt.lparen)) {
      return state.err(`Expected the lexeme “(” after the keyword “for”`, src);
    }
    let init: Statement | null = null;
    if (state.nextIs(tt.semicolon)) {
      init = init;
    } else if (state.nextIs(tt.let)) {
      const l = LET();
      if (l.isLeft()) return l;
      init = l.unwrap();
    } else {
      const e = EXPR();
      if (e.isLeft()) return e;
      init = e.unwrap();
    }
    let condition: Expr | null = null;
    if (!state.peek.is(tt.semicolon)) {
      const c = expr();
      if (c.isLeft()) return c;
      condition = c.unwrap();
    }
    if (!state.nextIs(tt.semicolon)) {
      return state.err(`Expected a “;” after the loop condition`, src);
    }
    let increment: Expr | null = null;
    if (!state.peek.is(tt.semicolon)) {
      const i = expr();
      if (i.isLeft()) return i;
      increment = i.unwrap();
    }
    if (!state.nextIs(tt.rparen)) {
      return state.err(`Expected a lexeme “)” after the loop’s clauses`, src);
    }
    if (!state.nextIs(tt.begin)) {
      return state.err(`Expected a block after the loop’s clauses`, src);
    }
    const b = BLOCK();
    if (b.isLeft()) return b;
    let body: Statement = b.unwrap();
    if (increment !== null) {
      (body as BlockStmt).stmts.push(exprStmt(increment));
    }
    const c = (condition === null) ? bool(true) : condition;
    body = loopStmt(c, body);
    if (init !== null) {
      body = block([init, body]);
    }
    return state.ok(body);
  };

  const RETURN = () => {
    const out = EXPR();
    return out.chain((e) => state.ok(returnStmt(e.expr)));
  };

  const PRINT = () => {
    const out = EXPR();
    return out.chain((e) => state.ok(printStmt(e.expr)));
  };

  const STMT = (): Left<Err> | Right<Statement> => {
    if (state.nextIs(tt.let)) return LET();
    if (state.nextIs(tt.fn)) return FN();
    if (state.nextIs(tt.if)) return IF();
    if (state.nextIs(tt.begin)) return BLOCK();
    if (state.nextIs(tt.while)) return WHILE();
    if (state.nextIs(tt.for)) return FOR();
    if (state.nextIs(tt.return)) return RETURN();
    if (state.nextIs(tt.print)) return PRINT();
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

  const parseExpression = (): Left<Err> | Right<Expr> => {
    state.next();
    const out = expr();
    if (out.isLeft()) {
      return out;
    }
    const res = out.unwrap();
    return right(res);
  };

  const run = () => {
    state.next(); // prime the state
    return program();
  };

  return {
    run,
    parseExpression,
  };
};

/**
 * Returns a full program parsing.
 */
export const syntax = (tokens: Token[]) => parse(tokens).run();

/**
 * Returns a parsing of only an expression.
 */
export const algebra = (tokens: Token[]) => parse(tokens).parseExpression();

/**
 * Performs a full syntax parse with all defaults.
 */
export const read = (src: string) => (
  syntax(imul(lexemes(src)))
);
const tf = (src: string) => imul(lexemes(src));

// const lexemes = lexicalAnalysis(src).map(symsplit).map(imul);
// print(lexemes);
// const parsing = syntaxAnalysis(lexemes);
// print(treeof(parsing));
// const result = interpret(parsing);

// const x = sum([int(2), int(3), product([sym("x"), sym("y")])]);
// const g = conventialTree(x);
// const h = algebraicTree(g);
// print(g);
// print(h);
