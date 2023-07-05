import { choice, list, maybe, regex } from "@weave/reed";
import { floor } from "./index.js";

// deno-fmt-ignore
enum tkn {
  nil, error, lparen, rparen, lbrace,
  rbrace, comma, dot,

  // numeric operators
  minus, plus, slash, caret,
  star,rem,mod, percent,
  bang,

  // relational operators
  eq, neq, lt,
  gt, lte, gte,

  // atoms
  symbol, string, number,
  unit, 

  // function calls
  eof,
}
type Tkn = { lex: string; type: tkn };

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

const INTEGER = /^-?(0|\+?[1-9]\d*)(?<!-0)/;
const pInt = regex(INTEGER);
const POSITIVE_FLOAT = /^(0|[1-9]\d*)(\.\d+)?/;
const addop = regex(/^(\+|-)/);
const pFloat = list([maybe(addop), regex(POSITIVE_FLOAT)]).map((x) =>
  x.join("")
);
const LETTER = /^(\w+)/;
const pVar = regex(LETTER);
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

const call = (f: string, args: ParsedNode[]): Call => ({
  f,
  args,
  type: ntype.call,
});

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

function tokenize(text:string) {
  
}

function parse(text: string) {
  const max = text.length;

  const keywords = new Map<string, Tkn>([
    ["rem", token(tkn.rem, "rem")],
    ["mod", token(tkn.mod, "mod")],
  ]);

  const functions = new Map<string, Tkn>([
    ["rem", token(tkn.rem, "rem")],
    ["mod", token(tkn.mod, "mod")],
  ]);

  let current = 0;
  const advance = () => text[current++];
  let last: Tkn | null = null;
  let peek = token(tkn.nil);
  const bounded = () => current <= max;
  const peekchar = () => text[current];

  const next = () => {
    if (current > max) return token(tkn.eof);
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

    let start = 0;
    const scan = () => {
      skipws();
      start = current;
      const c = advance();
      if ((/^(\d+)/).test(c)) {
        const res = pNum.parse(text.slice(current - 1));
        if (res.result.value) {
          const j = res.result.value;
          const out = token(tkn.number, j);
          current += j.length - 1;
          return out;
        }
      }
      if ((/^(\w+)/).test(c)) {
        const res = pVar.parse(text.slice(current - 1));
        if (res.result.value) {
          const j = res.result.value;
          let out = keywords.has(j) ? keywords.get(j)! : token(tkn.symbol, j);
          current += j.length - 1;
          return out;
        }
      }
      const match = (char: string) => (
        bounded() && (text[current] === char) && (current++)
      );
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
    const out = scan();
    last = peek;
    peek = out;
    return last;
  };
  const tokenize = () => {
    next();
    const out = [];
    for (let i = 0; i < text.length; i++) {
      out.push(next());
      if (current > max) break;
    }
    return out;
  };

  const exp = (minbp: number = 1): ParsedNode => {
    let t = next();
    let lhs: ParsedNode = nilnode;
    switch (t.type) {
      case tkn.lparen:
        lhs = exp(0);
        const n = next();
        if (n.type !== tkn.rparen) return err(`Expected “)”`);
        if (peek.type === tkn.lparen) {
          const rhs = exp(0);
          lhs = binex("*", lhs, rhs);
        }
        break;
      case tkn.number:
        lhs = num(t.lex);
        if (peek.type === tkn.lparen) {
          const rhs = exp(0);
          lhs = binex("*", lhs, rhs);
        } else if (peek.type === tkn.symbol) {
          const rhs = exp(0);
          lhs = binex("*", lhs, rhs);
        }
        break;
      case tkn.symbol:
        lhs = sym(t.lex);
        if (peek.type === tkn.rparen) {
        }
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
      case tkn.plus: return [null, 5];
      case tkn.minus: return [null, 5];
      default: return [null, null];
    }
  };
  const node = () => {
    next();
    return exp();
  };
  return { node };
}

const p = parse(`let f(x) = cos(x)`);
console.log(p);
