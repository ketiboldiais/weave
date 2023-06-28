import { Compiler } from "./compiler.js";
import {ASTNode} from './nodes/node.ast.js';

export type RVal =
  | number
  | boolean
  | null
  | string
  | Callable
  | ASTNode
  | RVal[];

export abstract class Callable {
  abstract call(compiler: Compiler, args: RVal[]): RVal;
  abstract arity(): number;
}
