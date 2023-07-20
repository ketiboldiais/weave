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
export type Numeric = tt.float | tt.int | tt.scientific | tt.frac | tt.complex;
export type UnaryOperator = tt.minus | tt.plus | tt.bang;
export type RelationalOperator =
  | tt.lt
  | tt.gt
  | tt.deq
  | tt.neq
  | tt.leq
  | tt.geq;
export type BooleanOperator =
  | tt.and
  | tt.nor
  | tt.xnor
  | tt.nand
  | tt.not
  | tt.or
  | tt.xor;
export type BinaryOperator =
  | tt.star
  | tt.plus
  | tt.caret
  | tt.minus
  | tt.slash
  | tt.rem
  | tt.mod
  | tt.percent;
export type ArithmeticOperator =
  | tt.minus
  | tt.plus
  | tt.slash
  | tt.star
  | tt.caret
  | tt.percent
  | tt.rem
  | tt.mod;

export enum nk {
  statement,
  expression,
}

export enum bp {
  nil,
  lowest,
	typesymbol,
	typeinfix,
	typeunary,
	typefn,
  assign,
  atom,
  or,
  nor,
  and,
  nand,
  xor,
  xnor,
  not,
  eq,
  rel,
  sum,
  prod,
  quot,
  pow,
  postfix,
  call,
}
