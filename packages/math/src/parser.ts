import { choice, list, lit, maybe, regex, ws } from "@weave/reed";

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

// deno-fmt-ignore
enum tkn {
  nil, error, lparen, rparen, lbrace,
  rbrace, comma, dot, minus,
  plus, slash, caret, star,rem,mod,
  percent, eq, neq, lt,
  gt, lte, gte,
  symbol, string, number,
  unit, bang,
  eof,
}


type Tkn = { lex: string; type: tkn };
type Err = { error: string };
enum ntype {
}
type Num = { num: number };
type Unit<T extends string = string> = { num: number; unit: T };
type Unex = { op: string; arg: PNode };
type Binex = { op: string; L: PNode; R: PNode };
type Variable = { sym: string };
type Nil = { type: "nil" };
type PNode = Binex | Num | Variable | Nil | Unex | Err | Call;

const err = (error: string) => ({ error });


const num = (x: string | number): Num => ({
  num: typeof x === "string" ? (x as any) * 1 : x,
});

const unit = <T extends string>(
  num: number,
  unit: T,
): Unit<T> => ({
  num,
  unit,
});


const unex = (op: string, arg: PNode): Unex => ({
  op,
  arg,
});

const binex = (op: string, L: PNode, R: PNode): Binex => ({
  L,
  op,
  R,
});
const sym = (symbol: string): Variable => ({
  sym: symbol,
});


const nilnode: Nil = { type: "nil" };

type Call = { f: string; args: PNode[] };

const call = (f: string, args: PNode[]) => ({
  f,
  args,
});

function expr(text: string) {
  const max = text.length;
  const token = (type: tkn, lex: string = ""): Tkn => ({
    lex,
    type,
  });
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
    const keywords = new Map<string, Tkn>([
      ["rem", token(tkn.rem, "rem")],
      ["mod", token(tkn.mod, "mod")],
    ]);
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

  const exp = (minbp: number = 1): PNode => {
    let t = next();
    let lhs: PNode = nilnode;
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
  const parse = () => {
    next();
    return exp();
  };
  return { tokenize, parse };
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


class Evaluator implements NodeHandler<PNode> {
  evaluate(node:PNode) {
    // switch ()
  }
  err(node: Err): PNode {
    return node;
  }
  num(node: Num): PNode {
    return node;
  }
  unit(node: Unit<string>): PNode {
    return node;
  }
  unex(node: Unex): PNode {
    return node;
  }
  binex(node: Binex): PNode {
    switch (node.op) {
    }
    return node;
  }
  sym(node: Variable): PNode {
    return node;
  }
  nil(node: Nil): PNode {
    return node;
  }
  call(node: Call): PNode {
    return node;
  }
}




const p = expr(`a = 2 - a`).parse();
