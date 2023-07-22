// deno-fmt-ignore
export enum tt {
  // utility tokens
  eof, error, empty,

  // paired delimiters
  lparen, rparen,
  lbrace, rbrace,
  lbracket, rbracket,
  
  // single delimiters
  comma, dot, 
  semicolon, 
  colon,

  // delimiters with operative semantics
  minus, plus, slash,
  star, bang, eq,
  gt, lt, caret, percent,

  // dipthongs with operative semantics
  deq, leq, geq,
  neq, 

  // literal values
  string,int,frac,complex,
  float,scientific,
  null,bool,

  // variables
  symbol,

  // named operators-arithmetic
  rem,mod,

  // named operators-logical
  and,nor,xnor,nand,
  not,or,xor,

  // type operators
  arrow,amp,vbar,tilde,

  // keywords
  fn, let, begin, end, if, else,
  nan,inf,while,for,return,
  then,print,

  // core function token
  call,
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
  | tt.or
  | tt.xor;
export type BinaryOperator =
  | tt.star
  | tt.plus
  | tt.minus
  | tt.caret
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

// deno-fmt-ignore
export enum nk {
  print, return, loop,
  conditional, native_call,
  user_fn_call, bool,
  callable,
  string, null, float, int,
  symbol, frac,
  complex, scientific,
  vector, not,
  logic, binary, matrix,
  relation, group,
  variable_statement,
  function_statement,
  block_statement,
  assign,
}

export const islit = (type: nk) => (
  type === nk.string ||
  type === nk.int ||
  type === nk.frac ||
  type === nk.complex ||
  type === nk.float ||
  type === nk.scientific ||
  type === nk.null ||
  type === nk.bool
);
export enum nc {
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
