import { choice, list, lit, maybe, regex, ws } from "@weave/reed";

// deno-fmt-ignore
enum tkn {
  nil, error, lparen, rparen, lbrace,
  rbrace, comma, dot, minus,
  plus, slash, caret, star,rem,mod,
  percent, eq, neq, lt,
  gt, lte, gte,
  symbol, string, number,
  unit,
  eof,
}
type Tkn = { lex: string; type: tkn };
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

type Num = { num: number };
const num = (x: string | number): Num => ({
  num: typeof x === "string" ? (x as any) * 1 : x,
});
type Unit<T extends string> = { num: number; unit: T };
const unit = <T extends string>(
  num: number,
  unit: T,
): Unit<T> => ({
  num,
  unit,
});

type Binex = { op: string; L: PNode; R: PNode };
const binex = (op: string, L: PNode, R: PNode): Binex => ({
  L,
  op,
  R,
});
type Variable = { sym: string };
const sym = (symbol: string): Variable => ({
  sym: symbol,
});
type Nil = { type: "nil" };
type PNode = Binex | Num | Variable | Nil;
const nilnode: Nil = { type: "nil" };

function expr(text: string) {
  const max = text.length;
  const token = (type: tkn, lex: string = ""): Tkn => ({
    lex,
    type,
  });
  let current = 0;
  const advance = () => {
    return text[current++];
  };
  let last: Tkn | null = null;
  let peek = token(tkn.nil);
  const bounded = () => current < max;
  const peekchar = () => {
    return text[current];
  };
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
    const keywords = new Set<string>([
      "rem",
      "mod",
    ]);
    const scan = () => {
      skipws();
      const c = advance();
      if ((/^(\d+)/).test(c)) {
        const res = pNum.parse(text.slice(current - 1));
        if (res.result.value) {
          const j = res.result.value;
          if (keywords.has(j)) {
            return token(tkn.rem, j);
          }
          const out = token(tkn.number, j);
          current += j.length - 1;
          return out;
        }
      }
      if ((/^(\w+)/).test(c)) {
        const res = pVar.parse(text.slice(current - 1));
        if (res.result.value) {
          const j = res.result.value;
          const out = token(tkn.symbol, j);
          current += j.length - 1;
          return out;
        }
      }
      const t = (tt: tkn) => token(tt, c);
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

  const exp = (minbp: number = 1) => {
    let t = next();
    let lhs: PNode = nilnode;
    switch (t.type) {
      case tkn.number:
        lhs = num(t.lex);
        break;
      case tkn.symbol:
        lhs = sym(t.lex);
        break;
    }
    while (bounded()) {
      let op = peek;
      if (op.type === tkn.eof) break;
      const [l_bp, r_bp] = infixbp(op.type);
      if (l_bp < minbp) break;
      next();
      let rhs = exp(r_bp);
      lhs = binex(op.lex, lhs, rhs);
    }
    return lhs;
  };
  const infixbp = (op: tkn): [number, number] => {
    // deno-fmt-ignore
    switch (op) {
      case tkn.plus:
      case tkn.minus: return [2,3];
      case tkn.star:
      case tkn.slash:
      case tkn.rem:
      case tkn.mod: return [4,5];
      case tkn.caret: return [8,2];
      default: return [1,1];
    }
  };
  const postfixbp = (op: tkn) => {
    switch (op) {
      case tkn.unit:
        return [7, null];
    }
  };

  const parse = () => {
    next();
    return exp();
  };

  return { tokenize, parse };
}
const x = expr(`3^x + 4^x`).parse();
console.log(x);
