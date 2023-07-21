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
  Program,
  RelationExpr,
  ReturnStmt,
  Statement,
  Variable,
  VariableStmt,
  VectorExpr,
  Visitor,
} from "./nodes.core";
import { Token } from "./token";
import { left, right } from "./util";

interface Resolvable<X = any> {
  resolve(expr: Expr, i: number): X;
}

class Resolver<T extends Resolvable = Resolvable> implements Visitor<void> {
  int(node: Integer): void {
    return;
  }
  scopesIsEmpty() {
    return this.scopes.length === 0;
  }
  peek() {
    return this.scopes[this.scopes.length - 1];
  }
  handler: T;
  constructor(handler: T) {
    this.handler = handler;
  }
  resolveLocal(node: Expr, name: Token) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name.lex)) {
        this.handler.resolve(node, this.scopes.length - 1 - i);
        return;
      }
    }
  }
  symbol(node: Variable): void {
    const name = node.name;
    if (
      !this.scopesIsEmpty() &&
      this.peek().get(name.lex) === false
    ) {
      throw new Error(
        `On line ${name.line}, from the resolver: The user sought to read a local variable “${name.lex}” in its own initializer, an operation with no semantic.`,
      );
    }
    this.resolveLocal(node, node.name);
    return;
  }
  float(node: Float): void {
    return;
  }
  constant(node: Literal): void {
    return;
  }
  binary(node: Binary): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  vector(node: VectorExpr): void {
    for (let i = 0; i < node.elements.length; i++) {
      this.resolve(node.elements[i]);
    }
    return;
  }
  fnCall(node: FnCall): void {
    this.resolve(node.callee);
    for (let i = 0; i < node.args.length; i++) {
      this.resolve(node.args[i]);
    }
    return;
  }
  nativeCall(node: NativeCall): void {
    for (let i = 0; i < node.args.length; i++) {
      this.resolve(node.args[i]);
    }
    return;
  }
  relation(node: RelationExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  notExpr(node: NotExpr): void {
    this.resolve(node.expr);
    return;
  }
  logicExpr(node: LogicalExpr): void {
    this.resolve(node.left);
    this.resolve(node.right);
    return;
  }
  group(node: Group): void {
    this.resolve(node.expression);
    return;
  }
  assign(node: AssignExpr): void {
    this.resolve(node.init);
    this.resolveLocal(node, node.name.name);
    return;
  }
  resolve(stmt: ASTNode) {
    stmt.accept(this);
  }
  resolveAll(stmts: Statement[]) {
    for (let i = 0; i < stmts.length; i++) {
      this.resolve(stmts[i]);
    }
  }
  scopes: (Map<string, boolean>)[] = [];
  beginScope() {
    this.scopes.push(new Map());
  }
  endScope() {
    this.scopes.pop();
  }
  blockStmt(node: BlockStmt): void {
    this.beginScope();
    this.resolveAll(node.stmts);
    this.endScope();
    return;
  }
  exprStmt(node: ExprStmt): void {
    this.resolve(node.expr);
    return;
  }
  resolveFn(node: FunctionStmt) {
    this.beginScope();
    for (let i = 0; i < node.params.length; i++) {
      this.declare(node.params[i]);
      this.define(node.params[i]);
    }
    this.resolve(node.body);
    this.endScope();
  }
  functionStmt(node: FunctionStmt): void {
    this.declare(node.name);
    this.define(node.name);
    this.resolveFn(node);
    return;
  }
  returnStmt(node: ReturnStmt): void {
    this.resolve(node.value);
    return;
  }
  ifStmt(node: IfStmt): void {
    this.resolve(node.condition);
    this.resolve(node.then);
    this.resolve(node.alt);
    return;
  }
  declare(name: Token) {
    if (this.scopes.length === 0) return;
    const scope = this.scopes[this.scopes.length - 1];
    scope.set(name.lex, false);
  }
  define(name: Token) {
    if (this.scopes.length === 0) return;
    const peek = this.scopes[this.scopes.length - 1];
    peek.set(name.lex, true);
  }
  varStmt(node: VariableStmt): void {
    this.declare(node.name);
    this.resolve(node.init);
    this.define(node.name);
    return;
  }
  loopStmt(node: LoopStmt): void {
    this.resolve(node.condition);
    this.resolve(node.body);
    return;
  }
	printStmt(node: PrintStmt): void {
		this.resolve(node.expr);
		return;
	}
  resolved(program: Program) {
    if (program.error !== null) {
      return left(program.error.message);
    }
    try {
      const stmts = program.code;
      for (let i = 0; i < stmts.length; i++) {
        this.resolve(stmts[i]);
      }
      return right(1);
    } catch (error) {
      const m = (error as Error).message;
      return left(m);
    }
  }
}

export const resolvable = (resolvable: Resolvable) => (
  new Resolver(resolvable)
);
