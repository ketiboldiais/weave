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
  toString() {
    return this.lex;
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
export const tkn = <T extends tt>(type: T, lex: string, line: number = -1) => (
  new Token(type, lex, line)
);
