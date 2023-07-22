import { dne } from "./util.js";
import { tt } from "./enums.js";
import { UnaryOperator } from "./enums.js";
import { BinaryOperator } from "./enums.js";
import { RelationalOperator } from "./enums.js";
import { BooleanOperator } from "./enums.js";
import { ArithmeticOperator } from "./enums.js";

export class Token<T extends tt = tt> {
  /**
   * The token’s given type.
   * This is a broader classification
   * of the token than the the lexeme.
   */
  tokenType: T;

  /** The token’s specific lexeme. */
  lex: string;

  /** The line where this token was encountered. */
  line: number;

  constructor(type: T, lex: string, line: number) {
    this.tokenType = type;
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
      !dne(type) ? type : this.tokenType,
      !dne(lex) ? lex : this.lex,
      !dne(line) ? line : this.line,
    );
  }

  /**
   * Returns true if the next token is a right paired-delimiter.
   * I.e., the tokens `)`, `}`, and `]`. Currently used by the scanner
   * to get rid of trailing commas.
   */
  isRPD() {
    return (
      this.tokenType === tt.rparen ||
      this.tokenType === tt.rbrace ||
      this.tokenType === tt.rbracket
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
      this.tokenType === tt.frac ||
      this.tokenType === tt.int ||
      this.tokenType === tt.float ||
      this.tokenType === tt.scientific
    );
  }
  onLine(n: number) {
    this.line = n;
    return this;
  }

  /**
   * Returns true if this operator
   * is a {@link UnaryOperator} token.
   */
  unary(): this is Token<UnaryOperator> {
    return (
      this.tokenType === tt.minus ||
      this.tokenType === tt.plus ||
      this.tokenType === tt.bang
    );
  }

  binary(): this is Token<BinaryOperator> {
    return (
      this.tokenType === tt.star ||
      this.tokenType === tt.plus ||
      this.tokenType === tt.caret ||
      this.tokenType === tt.slash ||
      this.tokenType === tt.rem ||
      this.tokenType === tt.percent
    );
  }

  /**
   * Returns true if this
   * token is a {@link RelationalOperator}
   * token.
   */
  relational(): this is Token<RelationalOperator> {
    return (
      this.tokenType === tt.lt ||
      this.tokenType === tt.gt ||
      this.tokenType === tt.deq ||
      this.tokenType === tt.neq ||
      this.tokenType === tt.leq ||
      this.tokenType === tt.geq
    );
  }

  logic(): this is Token<BooleanOperator> {
    return (
      this.tokenType === tt.and ||
      this.tokenType === tt.nor ||
      this.tokenType === tt.xnor ||
      this.tokenType === tt.nand ||
      this.tokenType === tt.nor ||
      this.tokenType === tt.or ||
      this.tokenType === tt.xor
    );
  }

  /**
   * Returns true if this token
   * matches the provided type.
   */
  is(type: T) {
    return this.tokenType === type;
  }
  among(types: tt[]) {
    for (let i = 0; i < types.length; i++) {
      if (this.tokenType === types[i]) return true;
    }
    return false;
  }
  toString() {
    return this.lex;
  }

  /**
   * Returns true if this token is an
   * {@link ArithmeticOperator} token.
   */
  arithmetic(): this is Token<ArithmeticOperator> {
    return (
      this.tokenType === tt.minus ||
      this.tokenType === tt.plus ||
      this.tokenType === tt.slash ||
      this.tokenType === tt.star ||
      this.tokenType === tt.caret ||
      this.tokenType === tt.percent ||
      this.tokenType === tt.rem ||
      this.tokenType === tt.mod
    );
  }

  /**
   * The token representation of the empty token,
   * used primarily as a placeholder and base
   * case.
   */
  static empty: Token = new Token(tt.empty, "", -1);
}

/**
 * Returns a new token.
 */
export const tkn = <T extends tt>(type: T, lex: string, line: number = -1) => (
  new Token(type, lex, line)
);
