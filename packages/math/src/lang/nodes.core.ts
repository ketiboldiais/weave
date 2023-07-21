import { Err } from "./err.js";
import {
  BinaryOperator,
  BooleanOperator,
  nk,
  RelationalOperator,
  tt,
} from "./enums.js";
import { Token } from "./token.js";
import { complex, floor, frac, toFrac } from "./util.js";
import { Value } from "./value.js";

export interface Visitor<T> {
  int(node: Integer): T;
  symbol(node: Variable): T;
  float(node: Float): T;
  constant(node: Literal): T;
  binary(node: Binary): T;
  vector(node: VectorExpr): T;
  fnCall(node: FnCall): T;
  nativeCall(node: NativeCall): T;
  relation(node: RelationExpr): T;
  notExpr(node: NotExpr): T;
  logicExpr(node: LogicalExpr): T;
  group(node: Group): T;
  assign(node: AssignExpr): T;
  printStmt(node: PrintStmt): T;
  blockStmt(node: BlockStmt): T;
  exprStmt(node: ExprStmt): T;
  functionStmt(node: FunctionStmt): T;
  returnStmt(node: ReturnStmt): T;
  ifStmt(node: IfStmt): T;
  varStmt(node: VariableStmt): T;
  loopStmt(node: LoopStmt): T;
}

export abstract class ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  kind: tt;
  nodeclass: nk;
  constructor(type: tt, kind: nk) {
    this.kind = type;
    this.nodeclass = kind;
  }
}

export abstract class Statement extends ASTNode {
  constructor(type: tt) {
    super(type, nk.statement);
  }
}

export class PrintStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.printStmt(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(tt.print);
    this.expr = expr;
  }
}
export const printStmt = (expr: Expr) => (
  new PrintStmt(expr)
);

export class ReturnStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.returnStmt(this);
  }
  value: Expr;
  constructor(value: Expr) {
    super(tt.return);
    this.value = value;
  }
}
export const returnStmt = (value: Expr) => (
  new ReturnStmt(value)
);

export class LoopStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.loopStmt(this);
  }
  condition: Expr;
  body: Statement;
  constructor(condition: Expr, body: Statement) {
    super(tt.while);
    this.condition = condition;
    this.body = body;
  }
}
export const loopStmt = (condition: Expr, body: Statement) => (
  new LoopStmt(condition, body)
);

export class IfStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.ifStmt(this);
  }
  condition: Expr;
  then: Statement;
  alt: Statement;
  constructor(condition: Expr, then: Statement, alt: Statement) {
    super(tt.if);
    this.condition = condition;
    this.then = then;
    this.alt = alt;
  }
}
export const ifStmt = (condition: Expr, then: Statement, alt: Statement) => (
  new IfStmt(condition, then, alt)
);

export class VariableStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.varStmt(this);
  }
  name: Token;
  init: Expr;
  type: string;
  constructor(name: Token, init: Expr, type: string) {
    super(tt.let);
    this.name = name;
    this.init = init;
    this.type = type;
  }
}
export const varstmt = (name: Token, init: Expr, type: string) => (
  new VariableStmt(name, init, type)
);

export class FunctionStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.functionStmt(this);
  }
  name: Token;
  params: Token[];
  body: Statement;
  paramTypes: string;
  returnType: string;
  constructor(
    name: Token,
    params: Token[],
    body: Statement,
    paramTypes: string,
    returnType: string,
  ) {
    super(tt.fn);
    this.name = name;
    this.params = params;
    this.body = body;
    this.paramTypes = paramTypes;
    this.returnType = returnType;
  }
}
export const fnStmt = (
  name: Token,
  params: Token[],
  body: Statement,
  paramTypes: string,
  returnType: string,
) => (
  new FunctionStmt(name, params, body, paramTypes, returnType)
);

export class ExprStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.exprStmt(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(expr.kind);
    this.expr = expr;
  }
}
export const exprStmt = (expr: Expr) => (
  new ExprStmt(expr)
);

export class BlockStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.blockStmt(this);
  }
  stmts: Statement[];
  constructor(stmts: Statement[]) {
    super(tt.begin);
    this.stmts = stmts;
  }
}
export const block = (statements: Statement[]) => (
  new BlockStmt(statements)
);

export abstract class Expr extends ASTNode {
  constructor(type: tt) {
    super(type, nk.expression);
  }
}
export const isExpr = (node: ASTNode): node is Expr => (
  node.nodeclass === nk.expression
);
export type NativeFn = "sin" | "cos" | "tan" | "-" | "+" | "!";
export class NativeCall extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nativeCall(this);
  }
  callee: NativeFn;
  args: Expr[];
  constructor(callee: NativeFn, args: Expr[]) {
    super(tt.call);
    this.callee = callee;
    this.args = args;
  }
  get arity() {
    return this.args.length;
  }
}
export const nativeCall = (callee: NativeFn, args: Expr[]) => (
  new NativeCall(callee, args)
);

export class FnCall extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.fnCall(this);
  }
  callee: Expr;
  args: Expr[];
  line: number;
  constructor(callee: Expr, args: Expr[], line: number) {
    super(tt.rparen);
    this.callee = callee;
    this.args = args;
    this.line = line;
  }
}
export const fnCall = (callee: Expr, args: Expr[], line: number) => (
  new FnCall(callee, args, line)
);

export class Literal extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.constant(this);
  }
  s: string | null | boolean;
  type: tt.string | tt.null | tt.bool;
  constructor(s: string | null | boolean, type: tt.string | tt.null | tt.bool) {
    super(type);
    this.s = s;
    this.type = type;
  }
  typeof() {
    return tt[this.type];
  }
}
export const str = (value: string) => (
  new Literal(value, tt.string)
);
export const nil = () => (
  new Literal(null, tt.null)
);

export const bool = (value: boolean) => (
  new Literal(value, tt.bool)
);

export class VectorExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vector(this);
  }
  elements: Expr[];
  loc: Token;
  constructor(elements: Expr[], loc: Token) {
    super(tt.lbracket);
    this.loc = loc;
    this.elements = elements;
  }
}
export const isVectorExpr = (node: ASTNode): node is VectorExpr => (
  node.kind === tt.lbracket
);
export const vectorExpr = (elements: Expr[], loc: Token) => (
  new VectorExpr(elements, loc)
);

export class AssignExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assign(this);
  }
  name: Variable;
  init: Expr;
  constructor(name: Variable, init: Expr) {
    super(tt.eq);
    this.name = name;
    this.init = init;
  }
}
export const assignment = (name: Variable, init: Expr) => (
  new AssignExpr(name, init)
);

export class NotExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.notExpr(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(tt.not);
    this.expr = expr;
  }
}
export const notExpr = (expr: Expr) => (
  new NotExpr(expr)
);

export class LogicalExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicExpr(this);
  }
  left: Expr;
  op: Token<BooleanOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BooleanOperator>, right: Expr) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}
export const logic = (left: Expr, op: Token<BooleanOperator>, right: Expr) => (
  new LogicalExpr(left, op, right)
);

export class RelationExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relation(this);
  }
  left: Expr;
  op: Token<RelationalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<RelationalOperator>, right: Expr) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export class Group extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.group(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(tt.lparen);
    this.expression = expression;
  }
}
export const group = (expr: Expr) => (
  new Group(expr)
);

export const relation = (
  left: Expr,
  op: Token<RelationalOperator>,
  right: Expr,
) => (
  new RelationExpr(left, op, right)
);

export class Float extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.float(this);
  }
  n: number;
  constructor(n: number) {
    super(tt.float);
    this.n = n;
  }
  toString(): string {
    return `${this.n}`;
  }
  get complex() {
    return complex([this.n, 0]);
  }
  get fraction() {
    return frac(toFrac(this.n));
  }
  get is0() {
    return this.n === 0;
  }
  get is1() {
    return this.n === 1;
  }
}
export const isFloat = (node: ASTNode): node is Float => (
  node.kind === tt.float
);
export const float = (value: string | number) => (
  new Float(+value)
);

export class Integer extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.int(this);
  }
  toString(): string {
    return `${this.n}`;
  }
  n: number;
  constructor(value: number) {
    super(tt.int);
    this.n = value;
  }
  get complex() {
    return complex([this.n, 0]);
  }
  get fraction() {
    return frac([this.n, 1]);
  }
  get is1() {
    return this.n === 1;
  }
  get is0() {
    return this.n === 0;
  }
}
export const isInteger = (node: ASTNode): node is Integer => (
  node.kind === tt.int
);
export const integer = (value: number | string) => (
  new Integer(floor(+value))
);

export class Variable extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.symbol(this);
  }
  toString(): string {
    return this.name.lex;
  }
  name: Token;
  type: string;
  constructor(name: Token, type: string) {
    super(tt.symbol);
    this.name = name;
    this.type = type;
  }
  equals(other: Variable) {
    return (this.name.lex === other.name.lex &&
      this.type === other.type);
  }
}
export const nomen = (name: Token, type: string) => (
  new Variable(name, type)
);
export const isSymbol = (node: ASTNode): node is Variable => (
  node.kind === tt.symbol
);

export type CoreFns =
  | "sin"
  | "cos"
  | "tan"
  | "arctan"
  | "+"
  | "-"
  | "!"
  | "*"
  | "neg"
  | "pos";

export class Binary extends Expr {
  toString(): string {
    return `${this.left.toString()} ${this.op.lex} ${this.right.toString()}`;
  }
  accept<T>(visitor: Visitor<T>): T {
    return visitor.binary(this);
  }
  left: Expr;
  op: Token<BinaryOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BinaryOperator>, right: Expr) {
    super(op.type);
    this.left = left;
    this.op = op;
    this.right = right;
  }
}

export const isBinary = (node: ASTNode): node is Binary => (
  node.nodeclass === nk.expression && (
    node.kind === tt.star ||
    node.kind === tt.plus ||
    node.kind === tt.caret ||
    node.kind === tt.slash ||
    node.kind === tt.mod ||
    node.kind === tt.percent
  )
);
export const binex = (
  left: Expr,
  op: Token<BinaryOperator>,
  right: Expr,
) => (
  new Binary(left, op, right)
);

export class Program {
  code: Statement[];
  error: Err | null;
  constructor(code: Statement[], error: Err | null) {
    this.code = code;
    this.error = error;
  }
}
export const success = (code: Statement[]) => (
  new Program(code, null)
);

export const failure = (error: Err) => (
  new Program([], error)
);
