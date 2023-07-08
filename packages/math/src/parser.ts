import { choice, list, lit, maybe, regex } from "@weave/reed";
import { floor, zip } from "./index.js";

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

interface CallTkn extends Tkn {
}

interface NumTkn extends Tkn {
  lit: number;
}
interface FnTkn extends Tkn {
  lit: (...args: any[]) => any;
  type: tkn.function;
}
interface FloatTkn extends NumTkn {
  type: tkn.float;
}
interface IntTkn extends NumTkn {
  type: tkn.int;
}

const tfn = (
  lex: string,
  lit: (...args: any[]) => any,
): FnTkn => ({
  lex,
  type: tkn.function,
  lit,
});

const tf = (lit: number): FloatTkn => ({
  lex: `${lit}`,
  type: tkn.float,
  lit,
});
const ti = (lit: number): IntTkn => ({
  lex: `${lit}`,
  type: tkn.int,
  lit,
});

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
interface ParsedNode {
  type: ntype;
}

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
  const symbols = new Map<string, Tkn>([
    ["cos", tfn("cos", Math.cos)],
    ["sin", tfn("sin", Math.sin)],
    ["tan", tfn("tan", Math.tan)],
  ]);
  const symOrElse = (key: string, token: Tkn) => (
    symbols.has(key) ? symbols.get(key)! : token
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
      const out = keywordOrElse(s, symOrElse(s, token(tkn.variable, s)));
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

  const tidySymbols = () => {
    const pretokens = initscan();
    if (pretokens.length < 2) return pretokens;
    const out: Tkn[] = [];
    for (let i = 0; i < pretokens.length; i++) {
      const current = pretokens[i];
      const lexeme = current.lex;
      if (
        current.type === tkn.variable && !symbols.has(lexeme) &&
        !isGreekLetterName(lexeme) && !hasUnderscore(lexeme)
      ) {
        const elems = [...lexeme];
        elems.forEach((e) =>
          out.push(
            token(tkn.variable, e),
          )
        );
      } else {
        out.push(current);
      }
    }
    return out;
  };

  const STAR = token(tkn.star, "*");
  const lparen = token(tkn.lparen, "(");
  const rparen = token(tkn.rparen, ")");

  const isImplicit = (current: tkn, next: tkn) => (
    (current === tkn.rparen && next === tkn.lparen) ||
    (current === tkn.rparen &&
      (next === tkn.variable)) ||
    (current === tkn.variable && (next === tkn.lparen)) ||
    (current === tkn.variable && next === tkn.variable)
  );

  const tidyProducts = () => {
    const pretokens = tidySymbols();
    if (pretokens.length < 2) return pretokens;
    const out: Tkn[] = [];
    for (let i = 0; i < pretokens.length; i++) {
      let prev = pretokens[i - 1];
      let current = pretokens[i];
      let next = pretokens[i + 1] || EOF;
      const prevIsNotLet = (prev !== undefined)
        ? (prev.type !== tkn.let)
        : true;
      if (
        current.type !== tkn.eof && isImplicit(current.type, next.type) &&
        prevIsNotLet
      ) {
        out.push(token(tkn.lparen, "("));
        out.push(current);
        while (i < pretokens.length && isImplicit(current.type, next.type)) {
          i++;
          current = pretokens[i];
          next = pretokens[i + 1] || EOF;
          out.push(STAR);
          out.push(current);
        }
        out.push(token(tkn.rparen, ")"));
      } else if (
        (current.type === tkn.int || current.type === tkn.float) &&
        next.type === tkn.variable
      ) {
        const maybeCaret = pretokens[i + 2];
        if (maybeCaret && maybeCaret.type === tkn.caret) {
          const maybePower = pretokens[i + 3];
          if (
            maybePower &&
            (maybePower.type === tkn.variable || maybePower.type === tkn.int ||
              maybePower.type === tkn.float)
          ) {
            out.push(lparen);
            out.push(
              current,
              STAR,
              lparen,
              next,
              maybeCaret,
              maybePower,
              rparen,
            );
            i += 3;
            out.push(rparen);
            continue;
          }
        }
        out.push(lparen);
        out.push(current);
        while (next.type === tkn.variable) {
          i++;
          current = pretokens[i];
          next = pretokens[i + 1] || EOF;
          out.push(STAR);
          out.push(current);
        }
        out.push(token(tkn.rparen, ")"));
        continue;
      }
      out.push(current);
    }
    return out;
  };

  return tidyProducts();
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
    switch (op) {
      case tkn.bang:
        return [7, null];
      default:
        return null;
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

const p = tokenize(`let f(x) = 2pi + 5`);
console.log(p);
