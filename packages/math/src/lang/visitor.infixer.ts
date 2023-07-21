import { Err } from "./err";
import {
  AssignExpr,
  ASTNode,
  Binary,
  BlockStmt,
  Expr,
  ExprStmt,
  Float,
  FnCall,
  FunctionStmt,
  Group,
  IfStmt,
  Integer,
  Literal,
  LogicalExpr,
  LoopStmt,
  NativeCall,
  NotExpr,
  PrintStmt,
  RelationExpr,
  ReturnStmt,
  Variable,
  VariableStmt,
  VectorExpr,
  Visitor,
} from "./nodes.core";
import { Left, Maybe, none, Right, some } from "./util";

class Infixer implements Visitor<string> {
  ap(node: ASTNode) {
    return node.accept(this);
  }
  nativeCall(node: NativeCall): string {
    return `(${node.callee} (${node.args.map((n) => this.ap(n)).join(",")}))`;
  }
  int(node: Integer): string {
    return `${node.n}`;
  }
  symbol(node: Variable): string {
    return node.name.lex;
  }
  float(node: Float): string {
    return `${node.n}`;
  }
  constant(node: Literal): string {
    return `${node.s}`;
  }
  binary(node: Binary): string {
    const l = this.ap(node.left);
    const r = this.ap(node.right);
    const op = node.op.lex;
    return `(${op} ${l} ${r})`;
  }
  vector(node: VectorExpr): string {
    const elements = node.elements.map(c => this.ap(c)).join(',')
    return `(vector [${elements}])`
  }
  fnCall(node: FnCall): string {
    const n = this.ap(node.callee);
    const args = node.args.map((e) => this.ap(e)).join(",");
    return `(${n} (${args}))`;
  }
  relation(node: RelationExpr): string {
    const l = this.ap(node.left);
    const r = this.ap(node.right);
    const op = node.op.lex;
    return `(${op} ${l} ${r})`;
  }
  notExpr(node: NotExpr): string {
    return `(! ${this.ap(node.expr)})`;
  }
  logicExpr(node: LogicalExpr): string {
    const l = this.ap(node.left);
    const r = this.ap(node.right);
    const op = node.op.lex;
    return `(${op} ${l} ${r})`;
  }
  group(node: Group): string {
    return `(${this.ap(node.expression)})`;
  }
  assign(node: AssignExpr): string {
    const name = node.name;
    const init = this.ap(node.init);
    return `(= ${name} ${init})`;
  }
  blockStmt(node: BlockStmt): string {
    const ns = node.stmts.map((n) => this.ap(n)).join("\n");
    return `(block ${ns})\n`;
  }
  exprStmt(node: ExprStmt): string {
    const ns = this.ap(node.expr);
    return `(expr ${ns})\n`;
  }
  functionStmt(node: FunctionStmt): string {
    const as = node.params.map((p) => p.lex).join(",");
    const f = this.ap(node.body);
    return `(fn ${node.name} (${as}) (${f}))`;
  }
  ifStmt(node: IfStmt): string {
    const cond = this.ap(node.condition);
    const ifb = this.ap(node.then);
    const efb = this.ap(node.alt);
    return `(if (${cond}) (${ifb}) (${efb}))`;
  }
  varStmt(node: VariableStmt): string {
    const name = node.name.lex;
    const init = this.ap(node.init);
    return `(let ${name} ${init})`;
  }
  loopStmt(node: LoopStmt): string {
    const cond = this.ap(node.condition);
    const body = this.ap(node.body);
    return `(while ${cond} ${body})`;
  }
  returnStmt(node: ReturnStmt): string {
    return `(return ${this.ap(node.value)})`
  }
  printStmt(node: PrintStmt): string {
    return `(print ${this.ap(node.expr)})`
  }
  map(result: ASTNode) {
    return (this.ap(result));
  }
}

export const toInfix = (result: Right<Expr> | Left<Err>) => (
  result.isLeft()
    ? `${result.unwrap().message}`
    : new Infixer().map(result.unwrap())
);
