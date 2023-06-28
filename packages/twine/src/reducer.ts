import { Compiler } from "./compiler";
import { Assign } from "./nodes/node.assign";
import { ASTNode } from "./nodes/node.ast";
import { Atom, nFloat, nNil } from "./nodes/node.atom";
import { Binex } from "./nodes/node.binex";
import { Block } from "./nodes/node.block";
import { Call } from "./nodes/node.call";
import { Cond } from "./nodes/node.cond";
import { Derivative } from "./nodes/node.derivative";
import { FunDef } from "./nodes/node.fundef";
import { Getex } from "./nodes/node.getex";
import { Group } from "./nodes/node.group";
import { Loop } from "./nodes/node.loop";
import { PrintNode } from "./nodes/node.print";
import { Return } from "./nodes/node.return";
import { Setex } from "./nodes/node.setex";
import { Sym } from "./nodes/node.sym";
import { Tuple } from "./nodes/node.tuple";
import { Unex } from "./nodes/node.unex";
import { VarDef } from "./nodes/node.vardef";
import { VectorExpr } from "./nodes/node.vector";
import { Visitor } from "./nodes/node.visitor";

class Deriver implements Visitor {
  compiler: Compiler;
  constructor(compiler: Compiler) {
    this.compiler = compiler;
  }
  derive(node: ASTNode): ASTNode {
    return node.accept(this);
  }
  atom<x>(node: Atom<x>) {
    return node;
  }
  sym(node: Sym) {
    const name = node.symbol._lexeme;
		const out = this.compiler.lookup(name, node);
		if (out === undefined) return node;
		if (typeof out === 'number') {
			return nFloat(`${out}`);
		}
		return nNil;
  }
  getex(node: Getex) {
    throw new Error("Method not implemented.");
  }
  setex(node: Setex) {
    throw new Error("Method not implemented.");
  }
  binex(node: Binex) {
    throw new Error("Method not implemented.");
  }
  unex(node: Unex) {
    throw new Error("Method not implemented.");
  }
  derivative(node: Derivative) {
    throw new Error("Method not implemented.");
  }
  group(node: Group) {
    throw new Error("Method not implemented.");
  }
  tuple(node: Tuple) {
    throw new Error("Method not implemented.");
  }
  callex(node: Call) {
    throw new Error("Method not implemented.");
  }
  vector(node: VectorExpr) {
    throw new Error("Method not implemented.");
  }
  assign(node: Assign) {
    throw new Error("Method not implemented.");
  }
  varStmt(node: VarDef) {
    throw new Error("Method not implemented.");
  }
  funStmt(node: FunDef) {
    throw new Error("Method not implemented.");
  }
  blockStmt(node: Block) {
    throw new Error("Method not implemented.");
  }
  condStmt(node: Cond) {
    throw new Error("Method not implemented.");
  }
  returnStmt(node: Return) {
    throw new Error("Method not implemented.");
  }
  loopStmt(node: Loop) {
    throw new Error("Method not implemented.");
  }
  printStmt(node: PrintNode) {
    throw new Error("Method not implemented.");
  }
}
