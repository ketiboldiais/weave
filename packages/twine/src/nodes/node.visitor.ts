import { Assign } from "./node.assign.js";
import { Atom } from "./node.atom.js";
import { Binex } from "./node.binex.js";
import { Block } from "./node.block.js";
import { Call } from "./node.call.js";
import { Cond } from "./node.cond.js";
import { FunDef } from "./node.fundef.js";
import { Getex } from "./node.getex.js";
import { Group } from "./node.group.js";
import { Loop } from "./node.loop.js";
import { PrintNode } from "./node.print.js";
import { Return } from "./node.return.js";
import { Setex } from "./node.setex.js";
import { Sym } from "./node.sym.js";
import { Unex } from "./node.unex.js";
import { VarDef } from "./node.vardef.js";
import { VectorExpr } from "./node.vector.js";
import { Tuple } from "./node.tuple.js";

export interface Visitor<t = any> {
  atom<x>(node: Atom<x>): t;
  sym(node: Sym): t;
  getex(node: Getex): t;
  setex(node: Setex): t;
  binex(node: Binex): t;
  unex(node: Unex): t;
  group(node: Group): t;
  tuple(node: Tuple): t;
  callex(node: Call): t;
  vector(node: VectorExpr): t;
  assign(node: Assign): t;
  varStmt(node: VarDef): t;
  funStmt(node: FunDef): t;
  blockStmt(node: Block): t;
  condStmt(node: Cond): t;
  returnStmt(node: Return): t;
  loopStmt(node: Loop): t;
  printStmt(node: PrintNode): t;
}
