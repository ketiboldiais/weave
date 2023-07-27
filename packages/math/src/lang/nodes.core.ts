import { Err } from "./err.js";
import {
  BinaryOperator,
  BooleanOperator,
  nc,
  nk,
  RelationalOperator,
  tt,
} from "./enums.js";
import { Token } from "./token.js";
import { complex, floor, frac, toFrac } from "./util.js";
import { Value } from "./value.js";

export interface Visitor<T> {
  /**
   * Visits an integer node.
   * Integer nodes have no `entype` method
   * since they are always of type `int`.
   */
  int(node: Integer): T;
  /**
   * Visits a float node.
   * Float nodes have no `entype` method
   * since they are always of type `float`.
   */
  float(node: Float): T;
  /**
   * Visits a symbol node.
   * Symbol nodes have an `entype` method
   * since they may bind to any node.
   */
  symbol(node: Variable): T;
  /**
   * Visits a constant node (a node
   * of type `string`, `null`, or `bool`).
   * Constant nodes have no entype method
   * since they are always one of the aforementioned
   * types.
   */
  literal(node: Literal): T;
  /**
   * Visits a binary expression node.
   * Binary expressions have an entype
   * method, since the left and right
   * operands may be arbitrary types.
   */
  binary(node: Binary): T;
  /**
   * Visits a vector node.
   * Vector nodes have no entype
   * method since they are always
   * of type `number[]`.
   */
  vector(node: VectorExpr): T;
  /**
   * Visits a matrix node.
   * Matrix nodes have no entype
   * method since they are always
   * of type `number[][]`.
   */
  matrix(node: MatrixExpr): T;
  /**
   * Visits a user function call.
   * User function calls always have
   * an entype method.
   */
  fnCall(node: FnCall): T;
  /**
   * Visits a native call expression.
   * Native calls never have an entype
   * method because they’re internal.
   */
  nativeCall(node: NativeCall): T;
  /**
   * Visits a relation node.
   * Relation nodes always have an entype
   * method because the left and right
   * operands may be arbitrary nodes.
   */
  relation(node: RelationExpr): T;
  /**
   * Visits a logical not expression.
   * The not expression has an entype
   * method since its argument may be
   * an arbitrary node.
   */
  notExpr(node: NotExpr): T;
  /**
   * Visits a logic expression.
   * Logic expressions always have an entype
   * method because the left and right operands
   * may be arbitrary nodes.
   */
  logicExpr(node: LogicalExpr): T;
  /**
   * Visits a group expression.
   * Group expressions always have an
   * entype method because the inner
   * expression may be an arbitrary
   * node.
   */
  group(node: Group): T;
  /**
   * Visits an assignment expression.
   * Assignment expressions always have
   * an entype method because the
   * the variables may be assigned arbitrary
   * values.
   */
  assign(node: AssignExpr): T;
  /**
   * Visits a print statement.
   * Print statements never have an entype
   * method because they always have the type:
   * ~~~
   * _ -> null
   * ~~~
   */
  printStmt(node: PrintStmt): T;
  /**
   * Visits a block statement.
   * Block statements have an
   * entype method since they
   * may return some arbitrary
   * type.
   */
  blockStmt(node: BlockStmt): T;
  /**
   * Visits an expression statement.
   * Expression statements have an entype
   * method since they may map to some
   * arbitrary expression.
   */
  exprStmt(node: ExprStmt): T;
  /**
   * Visits a function statement.
   * Function statements have an entype
   * method, taking an argument that will
   * construct the type signature:
   *
   * ~~~
   * fn symbol := type
   * ~~~
   */
  functionStmt(node: FunctionStmt): T;
  returnStmt(node: ReturnStmt): T;
  ifStmt(node: IfStmt): T;
  /**
   * Visits a variable statement.
   * Variable statements have an entype
   * method, corresponding to a type
   * signature:
   *
   * ~~~
   * symbol := type
   * ~~~
   */
  varStmt(node: VariableStmt): T;
  loopStmt(node: LoopStmt): T;
}

export abstract class ASTNode {
  abstract accept<T>(visitor: Visitor<T>): T;
  kind: nk;
  nodeclass: nc;
  type: string = "_";
  constructor(nodeclass: nc, kind: nk) {
    this.kind = kind;
    this.nodeclass = nodeclass;
  }
  /**
   * Returns true if this
   * node is typed (i.e., not
   * the empty string).
   */
  isTyped() {
    return this.type !== "_";
  }
}

export abstract class Statement extends ASTNode {
  constructor(kind: nk) {
    super(nc.statement, kind);
  }
}

export class PrintStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.printStmt(this);
  }
  type: "_ -> null" = "_ -> null";
  expr: Expr;
  constructor(expr: Expr) {
    super(nk.print);
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
    super(nk.return);
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
    super(nk.loop);
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
    super(nk.conditional);
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
  type: `${string} := ${string}`;
  constructor(name: Token, init: Expr, type: string) {
    super(nk.variable_statement);
    this.name = name;
    this.init = init;
    this.type = `${name.lex} := ${type}`;
  }
  entype(initType: string) {
    this.type = `${this.name.lex} := ${initType}`;
  }
}
export const varstmt = (name: Token, init: Expr, type: string = "_") => (
  new VariableStmt(name, init, type)
);

export class FunctionStmt extends Statement {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.functionStmt(this);
  }
  name: Token;
  params: Token[];
  body: Statement;
  type: `${string} := ${string} -> ${string}`;
  constructor(
    name: Token,
    params: Token[],
    body: Statement,
    paramTypes: string,
    returnType: string,
  ) {
    super(nk.function_statement);
    this.name = name;
    this.params = params;
    this.body = body;
    this.type = `${name.lex} := ${paramTypes} -> ${returnType}`;
  }
  entype(paramTypes: string[], returnType: string) {
    this.type = `${this.name.lex} := ${paramTypes.join("")} -> ${returnType}`;
    return this;
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
  entype(value: string) {
    this.type = value;
    return this;
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
    super(nk.block_statement);
    this.stmts = stmts;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}
export const block = (statements: Statement[]) => (
  new BlockStmt(statements)
);

export interface AlgebraicVisitor<T> {
  int(node: Integer): T;
  float(node: Float): T;
  symbol(node: Variable): T;
  literal(node: Literal): T;
  binary(node: Binary): T;
  vector(node: VectorExpr): T;
  matrix(node: MatrixExpr): T;
  fnCall(node: FnCall): T;
  nativeCall(node: NativeCall): T;
  relation(node: RelationExpr): T;
  notExpr(node: NotExpr): T;
  logicExpr(node: LogicalExpr): T;
  group(node: Group): T;
  assign(node: AssignExpr): T;
}

export abstract class Expr extends ASTNode {
  abstract map<T>(visitor: AlgebraicVisitor<T>): T;
  constructor(kind: nk) {
    super(nc.expression, kind);
  }
}
export const isExpr = (node: ASTNode): node is Expr => (
  node.nodeclass === nc.expression
);
export type NativeFn = "sin" | "cos" | "tan" | "log" | "ln" | "-" | "+" | "!";
export class NativeCall extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.nativeCall(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.nativeCall(this);
  }
  callee: NativeFn;
  args: Expr[];
  constructor(callee: NativeFn, args: Expr[]) {
    super(nk.native_call);
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
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.fnCall(this);
  }
  callee: Expr;
  args: Expr[];
  line: number;
  constructor(callee: Expr, args: Expr[], line: number) {
    super(nk.user_fn_call);
    this.callee = callee;
    this.args = args;
    this.line = line;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}
export const fnCall = (callee: Expr, args: Expr[], line: number) => (
  new FnCall(callee, args, line)
);

export class Literal extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.literal(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.literal(this);
  }
  value: string | null | boolean;
  type: "string" | "null" | "bool";
  constructor(
    value: string | null | boolean,
    nodeclass: nk.string | nk.null | nk.bool,
    type: "string" | "null" | "bool",
  ) {
    super(nodeclass);
    this.value = value;
    this.type = type;
  }
}

export const str = (value: string) => (
  new Literal(value, nk.string, "string")
);
export const nil = () => (
  new Literal(null, nk.null, "null")
);

export const bool = (value: boolean) => (
  new Literal(value, nk.bool, "bool")
);

export class VectorExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.vector(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.vector(this);
  }
  elements: Expr[];
  loc: number;
  type: "vector" = "vector";
  constructor(elements: Expr[], loc: number) {
    super(nk.vector);
    this.loc = loc;
    this.elements = elements;
  }
}
export const isVectorExpr = (node: ASTNode): node is VectorExpr => (
  node.kind === nk.vector
);
export const vectorExpr = (elements: Expr[], loc: number) => (
  new VectorExpr(elements, loc)
);

export class MatrixExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.matrix(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.matrix(this);
  }
  vectors: VectorExpr[];
  rows: number;
  cols: number;
  type: "matrix" = "matrix";
  constructor(vectors: VectorExpr[], rows: number, cols: number) {
    super(nk.matrix);
    this.vectors = vectors;
    this.rows = rows;
    this.cols = cols;
  }
}
export const matrixExpr = (
  vectors: VectorExpr[],
  rows: number,
  cols: number,
) => (
  new MatrixExpr(vectors, rows, cols)
);

export class AssignExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.assign(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.assign(this);
  }
  name: Token;
  init: Expr;
  constructor(name: Token, init: Expr) {
    super(nk.assign);
    this.name = name;
    this.init = init;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}
export const assignment = (name: Token, init: Expr) => (
  new AssignExpr(name, init)
);

export class NotExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.notExpr(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.notExpr(this);
  }
  expr: Expr;
  constructor(expr: Expr) {
    super(nk.not);
    this.expr = expr;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}

export const notExpr = (expr: Expr) => (
  new NotExpr(expr)
);

export class LogicalExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.logicExpr(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.logicExpr(this);
  }
  left: Expr;
  op: Token<BooleanOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BooleanOperator>, right: Expr) {
    super(nk.logic);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}
export const logic = (left: Expr, op: Token<BooleanOperator>, right: Expr) => (
  new LogicalExpr(left, op, right)
);

export class RelationExpr extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.relation(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.relation(this);
  }
  left: Expr;
  op: Token<RelationalOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<RelationalOperator>, right: Expr) {
    super(nk.relation);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}

export class Group extends Expr {
  accept<T>(visitor: Visitor<T>): T {
    return visitor.group(this);
  }
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.group(this);
  }
  expression: Expr;
  constructor(expression: Expr) {
    super(nk.group);
    this.expression = expression;
  }
  entype(value: string) {
    this.type = value;
    return this;
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
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.float(this);
  }
  n: number;
  type: "float" = "float";
  constructor(n: number) {
    super(nk.float);
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
  node.kind === nk.float
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
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.int(this);
  }
  n: number;
  type: "int" = "int";
  constructor(value: number) {
    super(nk.int);
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
  node.kind === nk.int
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
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.symbol(this);
  }
  name: Token;
  constructor(name: Token, type: string) {
    super(nk.symbol);
    this.name = name;
    this.type = type;
  }
  equals(other: Variable) {
    return (this.name.lex === other.name.lex &&
      this.type === other.type);
  }
  entype(typename: string) {
    this.type = typename;
    return this;
  }
}
export const nomen = (name: Token, type: string) => (
  new Variable(name, type)
);
export const isSymbol = (node: ASTNode): node is Variable => (
  node.kind === nk.symbol
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
  map<T>(visitor: AlgebraicVisitor<T>): T {
    return visitor.binary(this);
  }
  left: Expr;
  op: Token<BinaryOperator>;
  right: Expr;
  constructor(left: Expr, op: Token<BinaryOperator>, right: Expr) {
    super(nk.binary);
    this.left = left;
    this.op = op;
    this.right = right;
  }
  entype(value: string) {
    this.type = value;
    return this;
  }
}

export const isBinary = (node: ASTNode): node is Binary => (
  node.kind === nk.binary
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
