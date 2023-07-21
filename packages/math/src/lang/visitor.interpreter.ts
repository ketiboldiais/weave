import { cos, sin, tan } from "../index.js";
import { BinaryOperator, nk, tt } from "./enums.js";
import { env, Environment } from "./environment.js";
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
import { Token } from "./token.js";
import {
  isarray,
  isboolean,
  isnumber,
  isset,
  isstring,
  left,
  mod,
  percent,
  print,
  right,
} from "./util.js";
import { Value } from "./value.js";
import { resolvable } from "./visitor.resolver.js";

export class Fn {
  private fnStmt: FunctionStmt;
  private closure: Environment;
  nodeclass: nk.callable = nk.callable;
  constructor(fnStmt: FunctionStmt, closure: Environment) {
    this.fnStmt = fnStmt;
    this.closure = closure;
  }
  call(interpreter: Interpreter, args: Value[]) {
    const environment = env(this.closure);
    for (let i = 0; i < this.fnStmt.params.length; i++) {
      environment.define(this.fnStmt.params[i].lex, args[i]);
    }
    const c = this.fnStmt.body;
    try {
      const out = interpreter.execute([c], environment);
      return out;
    } catch (e) {
      if (e instanceof Return) {
        const out = e.value;
        return out;
      } else {
        throw new Error((e as Error).message);
      }
    }
  }
}

class Return extends Error {
  value: Value;
  constructor(value: Value) {
    super();
    this.value = value;
  }
}

const returnValue = (value: Value) => (
  new Return(value)
);

const isTruthy = (x: any) => {
  if (typeof x === "boolean") return x;
  if (x === null || x === undefined) return false;
  if (isnumber(x)) return (!Number.isNaN(x)) && (x !== 0);
  if (isstring(x) || isarray(x)) return x.length !== 0;
  if (isset(x)) return x.size !== 0;
  return true;
};

export class Interpreter implements Visitor<Value> {
  env: Environment;
  globals: Environment;
  locals: Map<Expr, number>;
  resolve(expr: Expr, depth: number) {
    this.locals.set(expr, depth);
  }

  constructor() {
    this.globals = env(null);
    this.env = this.globals;
    this.locals = new Map();
  }

  interpret(program: Program) {
    try {
      const code = program.code;
      const C = code.length;
      let result: Value = null;
      for (let i = 0; i < C; i++) {
        result = this.ap(code[i]);
      }
      return right(result);
    } catch (error) {
      const erm = (error as Error).message;
      return left(erm);
    }
  }
  private lookup(name: Token, expr: Expr) {
    const distance = this.locals.get(expr);
    if (distance !== undefined) {
      return this.env.getAt(distance, name.lex);
    } else {
      return this.globals.get(name);
    }
  }

  ap(node: ASTNode) {
    return node.accept(this);
  }
  int(node: Integer): Value {
    return node.n;
  }
  symbol(node: Variable): Value {
    return this.lookup(node.name, node);
  }
  float(node: Float): Value {
    return node.n;
  }
  constant(node: Literal): Value {
    return node.s;
  }
  binary(node: Binary): Value {
    const L = this.ap(node.left) as number;
    const R = this.ap(node.right) as number;
    const op = node.op;
    // deno-fmt-ignore
    switch (op.type) {
      case tt.star: return L * R;
      case tt.plus: return L + R;
      case tt.minus: return L - R;
      case tt.caret: return L ** R;
      case tt.slash: return L / R;
      case tt.rem: return L % R;
      case tt.mod: return mod(L, R);
      case tt.percent: return percent(L, R);
    }
  }
  vector(node: VectorExpr): Value {
    const elements = node.elements.map((e) => this.ap(e));
    return elements;
  }
  fnCall(node: FnCall): Value {
    const n = this.ap(node.callee);
    const args: Value[] = [];
    for (let i = 0; i < node.args.length; i++) {
      args.push(this.ap(node.args[i]));
    }
    if (!(n instanceof Fn)) {
      const message =
        `On line ${node.line}, from the interpreter: The user attempted to apply a non-function.`;
      throw new Error(message);
    }
    return n.call(this, args);
  }
  relation(node: RelationExpr): Value {
    const L = this.ap(node.left) as number;
    const R = this.ap(node.right) as number;
    const op = node.op;
    // deno-fmt-ignore
    switch (op.type) {
			case tt.lt: return L < R;
			case tt.gt: return L > R;
			case tt.deq: return L === R;
			case tt.neq: return L !== R;
			case tt.leq: return L <= R;
			case tt.geq: return L >= R;
		}
  }
  logicExpr(node: LogicalExpr): Value {
    const L = isTruthy(this.ap(node.left));
    const R = isTruthy(this.ap(node.right));
    const op = node.op;
    // deno-fmt-ignore
    switch (op.type) {
      case tt.and: return L && R;
      case tt.nor: return !(L || R);
      case tt.xnor: return L === R;
      case tt.nand: return !(L && R);
      case tt.or: return L || R;
      case tt.xor: return L !== R;
    }
  }
  nativeCall(node: NativeCall): Value {
    const args = node.args.map((v) => this.ap(v));
    const callee = node.callee;
    if (node.arity === 1) {
      const n = args[0] as number;
      // deno-fmt-ignore
      switch (callee) {
        case "+": return +n;
        case "-": return -n;
				case 'cos': return cos(n);
				case 'sin': return sin(n);
				case 'tan': return tan(n);
      }
    }
    throw new Error(`${callee} not implemented.`);
  }
  notExpr(node: NotExpr): Value {
    const n = isTruthy(this.ap(node.expr));
    return !n;
  }
  group(node: Group): Value {
    return this.ap(node.expression);
  }
  assign(node: AssignExpr): Value {
    const value = this.ap(node.init);
    const name = node.name.name;
    const distance = this.locals.get(node);
    if (distance !== undefined) {
      this.env.assignAt(distance, name, value);
    } else {
      this.globals.assign(name, value);
    }
    return value;
  }
  execute(statements: Statement[], env: Environment) {
    const prevEnv = this.env;
    let result: Value = null;
    this.env = env;
    for (let i = 0; i < statements.length; i++) {
      result = this.ap(statements[i]);
    }
    this.env = prevEnv;
    return result;
  }
  blockStmt(node: BlockStmt): Value {
    return this.execute(node.stmts, env(this.env));
  }
  exprStmt(node: ExprStmt): Value {
    return this.ap(node.expr);
  }
  functionStmt(node: FunctionStmt): Value {
    const f = new Fn(node, this.env);
    this.env.define(node.name.lex, f);
    return true;
  }
  ifStmt(node: IfStmt): Value {
    if (isTruthy(this.ap(node.condition))) {
      return this.ap(node.then);
    } else {
      return this.ap(node.alt);
    }
  }
  returnStmt(node: ReturnStmt): Value {
    const result = this.ap(node.value);
    throw new Return(result);
  }
  varStmt(node: VariableStmt): Value {
    const name = node.name.lex;
    const init = this.ap(node.init);
    return this.env.define(name, init);
  }
  loopStmt(node: LoopStmt): Value {
    let result: Value = null;
    while (isTruthy(this.ap(node.condition))) {
      result = this.ap(node.body);
    }
    return result;
  }
  printStmt(node: PrintStmt): Value {
    const value = this.ap(node.expr);
    console.log(value);
    return null;
  }
}

export const interpret = (program: Program) => {
  const interpreter = new Interpreter();
  const resolved = resolvable(interpreter).resolved(program);
  if (resolved.isLeft()) {
    return left(resolved.unwrap());
  }
  return interpreter.interpret(program);
};
