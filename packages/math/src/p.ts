// @ts-nocheck
import { choice, list, lit, regex } from "@weave/reed";
import { floor } from "./index.js";

// deno-fmt-ignore
enum tkn {
  nil, error, lparen, rparen, lbrace,
  rbrace, comma, dot,

  // numeric operators
  minus, plus, slash, caret,
  star,rem,mod, percent,
  bang,

  let,

  // relational operators
  eq, neq, lt,
  gt, lte, gte,

  // atoms
  variable, string, int, float,
  unit, call, function,

  // function calls
  eof,
}

interface Tkn {
  lex: string;
  type: tkn;
}

enum ntype {
  error,
  unit,
  unex,
  binex,
  number,
  symbol,
  nil,
  call,
}

interface ParsedNode { type: ntype; }
interface Err extends ParsedNode {
  error: string;
  type: ntype.error;
}
interface Num extends ParsedNode {
  num: number;
  type: ntype.number;
}
interface Unit extends ParsedNode {
  num: number;
  unit: string;
  type: ntype.unit;
}
interface Unex extends ParsedNode {
  op: string;
  arg: ParsedNode;
  type: ntype.unex;
}
interface Binex extends ParsedNode {
  op: string;
  L: ParsedNode;
  R: ParsedNode;
  type: ntype.binex;
}
interface Variable extends ParsedNode {
  sym: string;
  type: ntype.symbol;
}
interface Nil extends ParsedNode {
  type: ntype.nil;
}
interface Call extends ParsedNode {
  f: string;
  args: ParsedNode[];
  type: ntype.call;
}
interface NodeHandler<T> {
  err(node: Err): T;
  num(node: Num): T;
  unit(node: Unit): T;
  unex(node: Unex): T;
  binex(node: Binex): T;
  sym(node: Variable): T;
  nil(node: Nil): T;
  call(node: Call): T;
}
const INT = /^-?(0|\+?[1-9]\d*)(?<!-0)/;

const pInt = regex(INT).map((x) => token(tkn.int, x));

const pFloat = list([
  regex(INT),
  lit("."),
  regex(INT),
]).map((x) => token(tkn.float, x.join("")));

const pVar = regex(/^(\w+)/);
const pNum = choice([pFloat, pInt]);

const err = (error: string) => ({ error, type: ntype.error });

const num = (x: string | number): Num => ({
  num: typeof x === "string" ? (x as any) * 1 : x,
  type: ntype.number,
});

const unit = (
  num: number,
  unit: string,
): Unit => ({
  num,
  unit,
  type: ntype.unit,
});

const unex = (op: string, arg: ParsedNode): Unex => ({
  op,
  arg,
  type: ntype.unex,
});

const binex = (op: string, L: ParsedNode, R: ParsedNode): Binex => ({
  L,
  op,
  R,
  type: ntype.binex,
});
const sym = (sym: string): Variable => ({
  sym,
  type: ntype.symbol,
});

const nilnode: Nil = { type: ntype.nil };

const token = (type: tkn, lex: string = ""): Tkn => ({
  lex,
  type,
});

const binopReal = (a: Num, op: string, b: Num): ParsedNode => {
  const x = a.num;
  const y = b.num;
  switch (op) {
    case "+":
      return num(x + y);
    case "*":
      return num(x * y);
    case "/":
      return num(x / y);
    case "-":
      return num(x - y);
    case "^":
      return num(x ** y);
    case "mod":
      return num(((floor(x) % floor(y)) + floor(x)) % floor(y));
    case "rem":
      return num(floor(x) % floor(y));
    default:
      return err(`Unknown operator: ${op}`);
  }
};

class Evaluator implements NodeHandler<ParsedNode> {
  evaluate(node: ParsedNode) {
    const n: any = node;
    // deno-fmt-ignore
    switch (node.type) {
      case ntype.error: return this.err(n);
      case ntype.unit: return this.unit(n);
      case ntype.unex: return this.unex(n);
      case ntype.binex: return this.binex(n);
      case ntype.number: return this.num(n);
      case ntype.symbol: return this.sym(n);
      case ntype.nil: return this.nil(n);
      case ntype.call: return this.call(n);
    }
  }
  err(node: Err): ParsedNode {
    return node;
  }
  num(node: Num): ParsedNode {
    return node;
  }
  unit(node: Unit): ParsedNode {
    return node;
  }
  unex(node: Unex): ParsedNode {
    return node;
  }
  binex(node: Binex): ParsedNode {
    const lhs = this.evaluate(node.L);
    const rhs = this.evaluate(node.R);
    if (lhs.type === ntype.number && rhs.type === ntype.number) {
      // @ts-ignore
      return binopReal(lhs, node.op, rhs);
    }
    return node;
  }
  sym(node: Variable): ParsedNode {
    return node;
  }
  nil(node: Nil): ParsedNode {
    return node;
  }
  call(node: Call): ParsedNode {
    return node;
  }
}

const isDigitASCII = (c: string) => ("0" <= c && c <= "9");

const isLatinGreek = (c: string) => (
  /^[a-zA-Z_$\u00C0-\u02AF\u0370-\u03FF\u2100-\u214F]$/.test(c)
);
const isGreekLetterName = (c: string) => (
  /^(alpha|beta|gamma|delta|epsilon|zeta|theta|iota|kappa|lambda|mu|nu|xi|omicron|pi|rho|sigma|upsilon|phi|chi|psi|omega)/
    .test(c.toLowerCase())
);

const hasUnderscore = (c: string) => (
  [...c].includes("_")
);

function tokenize(text: string) {
  const max = text.length;
  const keywords = new Map<string, Tkn>([
    ["rem", token(tkn.rem, "rem")],
    ["mod", token(tkn.mod, "mod")],
    ["let", token(tkn.let, "let")],
  ]);
  const keywordOrElse = (key: string, token: Tkn) => (
    keywords.has(key) ? keywords.get(key)! : token
  );
  let current = 0;
  const advance = () => text[current++];
  const bounded = () => current <= max;
  const peekchar = () => text[current];
  const EOF = token(tkn.eof, `EOF`);
  const skipws = () => {
    while (bounded()) {
      const c = peekchar();
      // deno-fmt-ignore
      switch (c) {
          case " ":
          case "\r":
          case "\t": advance(); break;
          default: return;
        }
    }
  };
  const match = (char: string) => (
    bounded() && (text[current] === char) && (current++)
  );
  const scanNumber = () => {
    const res = pNum.parse(text.slice(current - 1));
    if (res.result.value) {
      const j = res.result.value;
      current += j.lex.length - 1;
      return j;
    }
    return token(tkn.error, `Expected number`);
  };
  const scanSymbol = () => {
    const res = pVar.parse(text.slice(current - 1));
    if (res.result.value) {
      const s = res.result.value;
      current += s.length - 1;
      const out = keywordOrElse(s, token(tkn.variable, s));
      return out;
    }
    return token(tkn.error, `Symbol`);
  };
  const scan = () => {
    let start = 0;
    if (current >= max) return EOF;
    skipws();
    start = current;
    const c = advance();
    if (isDigitASCII(c)) return scanNumber();
    if (isLatinGreek(c)) return scanSymbol();
    const t = (tt: tkn) => token(tt, text.slice(start, current));
    // deno-fmt-ignore
    switch (c) {
        case "(": return t(tkn.lparen);
        case ")": return t(tkn.rparen);
        case "{": return t(tkn.lbrace);
        case "}": return t(tkn.rbrace);
        case ",": return t(tkn.comma);
        case ".": return t(tkn.dot);
        case "+": return t(tkn.plus);
        case "-": return t(tkn.minus);
        case "*": return t(tkn.star);
        case "/": return t(tkn.slash);
        case "^": return t(tkn.caret);
        case "=": return t(tkn.eq);
        case "!": return t(match('=') ? tkn.neq : tkn.bang);
        case "<": return t(match('=') ? tkn.lte : tkn.lt);
        case ">": return t(match('=') ? tkn.gte : tkn.gt);
      }
    return token(tkn.error, `unknown token ${c}`);
  };
  const initscan = () => {
    const pretokens = [];
    for (let i = 0; i < text.length; i++) {
      const n = scan();
      pretokens.push(n);
      if (n.type === tkn.eof) break;
    }
    return pretokens;
  };
  return initscan();
}

function parse(input: string | Tkn[]) {
  const tokens: Tkn[] = (typeof input === "string") ? tokenize(input) : input;
  const max = tokens.length;
  let lastToken: Tkn | null = null;
  let peek = token(tkn.nil);
  let current = 0;
  const next = () => {
    lastToken = peek;
    peek = tokens[current++];
    return lastToken;
  };
  const bounded = () => (
    current <= max &&
    peek.type !== tkn.error &&
    peek.type !== tkn.eof
  );
  const exp = (minbp: number = 1): ParsedNode => {
    let t = next();
    let lhs: ParsedNode = nilnode;
    switch (t.type) {
      case tkn.lparen:
        lhs = exp(0);
        if (next().type !== tkn.rparen) {
          return err(`Expected “)”`);
        }
        break;
      case tkn.int:
        lhs = num(t.lex);
        break;
      case tkn.variable:
        lhs = sym(t.lex);
        break;
    }
    const [_, rbp] = prefixbp(t.type);
    if (rbp !== null) {
      const rhs = exp(rbp);
      lhs = unex(t.lex, rhs);
    }
    while (bounded()) {
      let op = peek;
      if (op.type === tkn.eof) break;
      const postfix = postfixbp(op.type);
      if (postfix !== null) {
        const [lbp] = postfix;
        if (lbp < minbp) break;
        next();
        lhs = unex(op.lex, lhs);
        continue;
      }
      const infix = infixbp(op.type);
      if (infix === null) break;
      const [l_bp, r_bp] = infix;
      if (l_bp === null || r_bp === null) break;
      if (l_bp < minbp) break;
      next();
      let rhs = exp(r_bp);
      lhs = binex(op.lex, lhs, rhs);
    }
    return lhs;
  };
  const infixbp = (op: tkn): [number, number] | null => {
    // deno-fmt-ignore
    switch (op) {
      case tkn.gte:
      case tkn.gt:
      case tkn.lte:
      case tkn.lt: return [2,3];
      case tkn.neq:
      case tkn.eq: return [3,4];
      case tkn.plus:
      case tkn.minus: return [6,5];
      case tkn.star:
      case tkn.slash:
      case tkn.rem:
      case tkn.mod: return [7,6];
      case tkn.caret: return [8,2];
      default: return null;
    }
  };
  const postfixbp = (op: tkn): [number, null] | null => {
    // deno-fmt-ignore
    switch (op) {
      case tkn.bang: return [7, null];
      default: return null;
    }
  };
  const prefixbp = (op: tkn): [null, number | null] => {
    // deno-fmt-ignore
    switch (op) {
      case tkn.plus: return [null, 10];
      case tkn.minus: return [null, 10];
      default: return [null, null];
    }
  };
  const run = () => {
    next();
    return exp();
  };
  return run();
}

const p = parse(`3 + 8`);
console.log(p);

  /*evaluate(program: Program) {
    if (program.error !== null) {
      return program.error;
    }
    let result: Option<RuntimeValue> = none();
    const nodes = program.nodes;
    for (let i = 0; i < nodes.length; i++) {
      result = this.evalnode(nodes[i]);
    }
    if (result._tag === "None") {
      return null;
    } else return result.value;
  }*/
  


  
class Ratio {
  n: number;
  d: number;
  constructor([n, d]: [number, number]) {
    this.n = n;
    this.d = d;
  }
  invert() {
    return Ratio.of(this.d, this.n);
  }
  abs() {
    return Ratio.of(Math.abs(this.n), Math.abs(this.d));
  }
  static get one() {
    return new Ratio([1, 1]);
  }
  static get infinity() {
    return new Ratio([Infinity, Infinity]);
  }
  ceil() {
    const one = new Ratio([1, 0]);
    return this.equals(this.floor()) ? this : this.floor().add(one);
  }
  floor() {
    const one = new Ratio([1, 0]);
    const trunc = Ratio.of(this.n / this.d, 1);
    if (this.gte(one) || trunc.equals(this)) {
      return trunc;
    }
    return trunc.sub(one);
  }
  lt(other: Ratio) {
    return this.lte(other) && !this.equals(other);
  }

  gt(other: Ratio) {
    return !this.lte(other);
  }

  gte(other: Ratio) {
    return this.gt(other) || this.equals(other);
  }
  lte(other: Ratio) {
    const { n: thisN, d: thisD } = Ratio.of(
      this.n,
      this.d,
    );
    const { n: otherN, d: otherD } = Ratio.of(
      other.n,
      other.d,
    );
    return thisN * otherD <= otherN * thisD;
  }
  sub(x: Ratio) {
    return Ratio.of(
      this.n * x.d - x.n * this.d,
      this.d * x.d,
    );
  }
  add(x: Ratio) {
    return Ratio.of(
      this.n * x.d + x.n * this.d,
      this.d * x.d,
    );
  }
  div(x: Ratio) {
    return Ratio.of(
      this.n * x.d,
      this.d * x.n,
    );
  }
  times(x: Ratio) {
    return Ratio.of(
      x.n * this.d,
      x.d * this.d,
    );
  }
  toString() {
    return `${this.n}/${this.d}`;
  }
  toFloat() {
    return this.n / this.d;
  }
  equals(other: Ratio) {
    const a = Ratio.from(this);
    const b = Ratio.from(other);
    return (
      a.n === b.n &&
      a.d === b.d
    );
  }
  pair(): [number, number] {
    return [this.n, this.d];
  }
  simplify() {
    return Ratio.from(this);
  }

  static of(n: number, d: number) {
    return new Ratio(simplify([n, d]));
  }
  static from(value: number | Ratio) {
    if (typeof value === "number") {
      return new Ratio(simplify(toFrac(value)));
    } else {
      return new Ratio(simplify(value.pair()));
    }
  }
}

const ratio = (n: number, d: number) => (
  new Ratio([n, d])
);

const a = ratio(1, 2).sub(ratio(1, 2));
console.log(a);
